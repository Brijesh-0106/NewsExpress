import { pipeline } from '@xenova/transformers';
import { Pinecone } from '@pinecone-database/pinecone';

// --- CONFIGURATION ---
const PINECONE_API_KEY = process.env.REACT_APP_PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.REACT_APP_PINECONE_INDEX || "news-index";
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

// Global instances
let embedder = null;
let pinecone = null;
let index = null;

export const initRAG = async () => {
    if (!embedder) {
        console.log("Initializing AI Embedding model (Xenova)...");
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    if (!pinecone && PINECONE_API_KEY && PINECONE_API_KEY !== "your_pinecone_api_key") {
        try {
            pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
            index = pinecone.index(PINECONE_INDEX_NAME);
        } catch (err) { console.error("Pinecone init failed:", err); }
    }
    return { embedder, index };
};

export const indexArticles = async (articles) => {
    await initRAG();
    const vectors = [];
    for (const art of articles) {
        try {
            const text = `Source: ${art.source?.name} Author: ${art.author} Date: ${art.publishedAt} Title: ${art.title} Summary: ${art.description} Body: ${art.content}`.trim();
            const output = await embedder(text, { pooling: 'mean', normalize: true });
            vectors.push({
                id: btoa(art.url).slice(0, 50),
                values: Array.from(output.data),
                metadata: { title: art.title, description: art.description || "", source: art.source?.name || 'Unknown', date: art.publishedAt }
            });
        } catch (e) { console.warn("Vector error:", e); }
    }
    if (index) { try { await index.upsert(vectors); } catch (err) { console.error("Pinecone error:", err); } }
    return vectors;
};

export const searchNews = async (query, localVectors = []) => {
    try {
        await initRAG();
        const queryEmbedding = await embedder(query, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(queryEmbedding.data);
        if (index) {
            try {
                const results = await index.query({ vector: queryVector, topK: 3, includeMetadata: true });
                if (results.matches?.length > 0) {
                    return results.matches.map(m => ({ title: m.metadata.title, content: m.metadata.description, source: m.metadata.source, date: m.metadata.date }));
                }
            } catch (e) { console.warn("Fallback:", e); }
        }
        if (localVectors.length === 0) return [];
        const results = localVectors.map(v => ({ ...v, score: cosineSimilarity(queryVector, v.values) }))
            .sort((a, b) => b.score - a.score).slice(0, 3);
        return results.map(r => ({ title: r.metadata.title, content: r.metadata.description, source: r.metadata.source, date: r.metadata.date }));
    } catch (error) { throw error; }
};

/**
 * FIXED SSE STREAMING for NOVA
 */
export const generateAnswerStream = async (query, context, onChunk) => {
    if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key") {
        onChunk("🚨 **SIMULATION MODE**\n---\nConnect your Groq API key for the full NOVA experience!");
        return;
    }

    const contextText = context.map(c => `[SOURCE: ${c.source} | ${c.date}]\nTITLE: ${c.title}\nDETAILS: ${c.content}`).join("\n\n---\n\n");
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: `You are NOVA — a razor-sharp AI news anchor for a premium digital newsroom.
                        Your job: transform raw context into gripping, accurate, beautifully formatted news.
                        
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        📌 CORE RULES
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        1. ONLY use facts from the provided CONTEXT. Never hallucinate or add outside knowledge.
                        2. If the context doesn't answer the question, say: "📭 Our sources don't cover this yet — stay tuned."
                        3. Cite implicitly by weaving facts naturally — no "[Source 1]" footnotes.
                        4. Match tone to story gravity: breaking news = urgent; features = measured; analysis = sharp.
                        
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        🖊️ FORMAT TEMPLATE (use every time)
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        
                        ## 🔴 [PUNCHY HEADLINE IN ALL CAPS]
                        > *One-sentence hook that makes the reader NEED to keep reading.*
                        
                        ---
                        
                        ### ⚡ THE STORY SO FAR
                        [2–3 sentences. The absolute must-know. Lead with the most important fact — not background.]
                        
                        ---
                        
                        ### 📌 KEY FACTS
                        - **[Entity/Person/Place]:** [Crisp fact]
                        - **[Number/Date/Stat]:** [Significance in plain language]
                        - **[Contrast or twist]:** [What makes this surprising or important]
                        *(3–5 bullets max. Each one punchy, standalone, memorable.)*
                        
                        ---
                        
                        ### 🔍 CONTEXT & SIGNIFICANCE
                        [2–3 sentences of "why this matters." Connect dots. Add stakes. Avoid jargon.]
                        
                        ---
                        
                        ### 🎯 WHAT TO WATCH
                        [1–2 sentences on what happens next or what question remains open.]
                        
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        ✍️ WRITING STYLE
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        - **Bold** names, numbers, and turning points
                        - *Italics* for direct quotes or notable phrases from the source
                        - Short sentences. Punchy verbs. Active voice.
                        - No filler: Treat the reader as smart but time-starved.`
                    },
                    { role: "user", content: `📰 SOURCE MATERIAL:\n\n${contextText}\n\n❓ READER'S QUESTION: ${query}` }
                ],
                temperature: 0.4,
                max_tokens: 1000,
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = ""; // Buffer to handle partial SSE lines

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop(); // Keep the last (potentially partial) line in the buffer

            for (const line of lines) {
                const cleanedLine = line.trim();
                if (cleanedLine.startsWith("data: ") && cleanedLine !== "data: [DONE]") {
                    try {
                        const json = JSON.parse(cleanedLine.replace("data: ", ""));
                        const text = json.choices[0].delta?.content || "";
                        fullText += text;
                        onChunk(fullText);
                    } catch (e) { /* silent skip for parse errors */ }
                }
            }
        }
    } catch (err) { onChunk("📡 **NOVA OFFLINE**\n---\nSignal lost. Please check your connection."); }
};

const cosineSimilarity = (v1, v2) => {
    let dotProduct = 0, mag1 = 0, mag2 = 0;
    for (let i = 0; i < v1.length; i++) {
        dotProduct += v1[i] * v2[i];
        mag1 += v1[i] * v1[i];
        mag2 += v2[i] * v2[i];
    }
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
};
