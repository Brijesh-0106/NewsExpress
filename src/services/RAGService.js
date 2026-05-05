import { pipeline } from '@xenova/transformers';
import { Pinecone } from '@pinecone-database/pinecone';

// --- CONFIGURATION ---
const PINECONE_API_KEY = "your_pinecone_api_key";
const PINECONE_INDEX = "news-index";

class RAGService {
    constructor() {
        this.embedder = null;
        this.pinecone = null;
        this.index = null;
    }

    // 1. Initialize the AI Model and Pinecone
    async init() {
        if (!this.embedder) {
            console.log("Loading AI Embedding model (Xenova)...");
            // Using a lightweight model suitable for browsers
            this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }

        if (!this.pinecone && PINECONE_API_KEY !== "your_pinecone_api_key") {
            try {
                this.pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
                this.index = this.pinecone.index(PINECONE_INDEX);
            } catch (err) {
                console.error("Pinecone init failed:", err);
            }
        }
    }

    // 2. Vectorize news articles and store them
    async indexArticles(articles) {
        if (!this.embedder) await this.init();
        
        console.log(`Vectorizing ${articles.length} articles...`);
        
        // In a real production app, you would upsert these to Pinecone here.
        // For this demo/setup, we'll return the embeddings for local processing
        // if Pinecone isn't configured yet.
        const vectors = [];
        for (const art of articles) {
            const text = `${art.title} ${art.description}`;
            const output = await this.embedder(text, { pooling: 'mean', normalize: true });
            vectors.push({
                id: art.url,
                values: Array.from(output.data),
                metadata: { title: art.title, description: art.description }
            });
        }

        // --- Pinecone Upsert (If Key Provided) ---
        if (this.index) {
            try {
                await this.index.upsert(vectors);
            } catch (err) {
                console.error("Pinecone upsert failed:", err);
            }
        }

        return vectors;
    }

    // 3. Search for relevant news based on query
    async search(query, localVectors = []) {
        if (!this.embedder) await this.init();

        const queryEmbedding = await this.embedder(query, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(queryEmbedding.data);

        // --- Option A: Pinecone Search ---
        if (this.index) {
            const results = await this.index.query({
                vector: queryVector,
                topK: 3,
                includeMetadata: true
            });
            return results.matches.map(m => ({
                title: m.metadata.title,
                content: m.metadata.description
            }));
        }

        // --- Option B: Local Semantic Search (Fallback) ---
        // This performs actual cosine similarity on the local vectors
        const results = localVectors.map(v => {
            const similarity = this.cosineSimilarity(queryVector, v.values);
            return { ...v, score: similarity };
        }).sort((a, b) => b.score - a.score).slice(0, 3);

        return results.map(r => ({
            title: r.metadata.title,
            content: r.metadata.description
        }));
    }

    cosineSimilarity(v1, v2) {
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            mag1 += v1[i] * v1[i];
            mag2 += v2[i] * v2[i];
        }
        return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
    }
}

export default new RAGService();
