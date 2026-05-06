import React, { useState, useRef, useEffect } from 'react';
import { indexArticles } from '../services/RAGService';

// Premium Markdown Parser for NOVA's responses
const formatMarkdown = (text) => {
    if (!text) return { __html: '' };
    
    let html = text
        .replace(/---/g, '<hr style="border:0; height:1px; background:var(--accent); opacity:0.3; margin:15px 0" />')
        .replace(/## (.*?)(?=\n|$)/g, '<h2 style="color:var(--accent); font-size:1.2rem; font-weight:800; margin-bottom:10px; letter-spacing:0.5px; text-transform:uppercase">$1</h2>')
        .replace(/### (.*?)(?=\n|$)/g, '<h3 style="color:#fff; font-size:1.05rem; font-weight:700; margin:15px 0 8px 0">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff; font-weight:700">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color:#cbd5e1; font-style:italic">$1</em>')
        .replace(/> (.*?)(?=\n|$)/g, '<blockquote style="border-left:3px solid var(--accent); margin:0 0 15px 0; padding-left:10px; color:#94a3b8; font-style:italic">$1</blockquote>')
        .replace(/- (.*?)(?=\n|$)/g, '<li style="margin-bottom:6px; line-height:1.5">$1</li>');

    // Wrap un-li'd bullets in a ul
    html = html.replace(/(<li.*?>.*?<\/li>)+/g, '<ul style="margin:0 0 15px 20px; padding:0">$&</ul>');

    // Handle normal paragraphs (double newline)
    html = html.replace(/\n\n/g, '<br/><br/>');
    // Handle single newlines inside blocks
    html = html.replace(/\n/g, '<br/>');
    
    return { __html: html };
};

const NewsAssistant = ({ articles }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am your AI News Assistant. I have semantically indexed today\'s stories. How can I help you explore them?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [localVectors, setLocalVectors] = useState([]);
    const chatEndRef = useRef(null);

    const suggestions = [
        "Summarize today's top stories",
        "Find news about technology",
        "Who are the key people in the news?",
    ];

    useEffect(() => {
        const handleOpenChat = (e) => {
            setIsOpen(true);
            if (e.detail) {
                // Ensure we don't trigger multiple sends if it's already typing
                // but we might want to let them anyway, so just use setTimeout to ensure state is ready
                setTimeout(() => {
                    handleSend(e.detail);
                }, 300);
            }
        };

        window.addEventListener('open-ai-chat', handleOpenChat);
        return () => window.removeEventListener('open-ai-chat', handleOpenChat);
    }, [localVectors]); // Depend on localVectors so handleSend uses the latest state

    useEffect(() => {
        const indexData = async () => {
            if (articles.length > 0) {
                // Only index articles that haven't been indexed yet (by URL)
                const existingUrls = new Set(localVectors.map(v => atob(v.id))); // IDs are base64 URLs
                const newArticles = articles.filter(art => !existingUrls.has(art.url));

                if (newArticles.length === 0) return;

                console.log(`Adding ${newArticles.length} new articles to index...`);
                try {
                    const newVectors = await indexArticles(newArticles);
                    setLocalVectors(prev => [...prev, ...newVectors]);
                } catch (e) {
                    console.error("Indexing failed:", e);
                }
            }
        };
        indexData();
    }, [articles, localVectors]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (text) => {
        const query = text || input;
        if (!query.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setInput('');
        setIsTyping(true);

        try {
            const { searchNews, generateAnswerStream } = await import('../services/RAGService');
            const matches = await searchNews(query, localVectors);
            
            if (matches.length > 0) {
                // Add empty message to stream into
                setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
                
                await generateAnswerStream(query, matches, (chunk) => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].content = chunk;
                        return newMsgs;
                    });
                });
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "🚨 **NO DIRECT MATCH**\n---\nI couldn't find a specific match for that in today's vector index. Try asking about a broader topic!" }]);
            }
        } catch (err) {
            console.error("NewsAssistant Error:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ **SYSTEM ERROR**\n---\nSomething went wrong with the news engine. Please refresh and try again." }]);
        }
        setIsTyping(false);
    };

    return (
        <>
            <div onClick={() => setIsOpen(!isOpen)} className="ai-bubble">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '110px',
                    right: '30px',
                    width: '400px',
                    height: '600px',
                    background: 'rgba(12, 12, 18, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                    overflow: 'hidden'
                }}>
                    <div style={{ background: '#12121e', padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent)' }}></div>
                            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'white' }}>NOVA Intelligence</span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button 
                                onClick={() => setMessages([{ role: 'assistant', content: 'Hi! I am NOVA, your AI News Anchor. How can I help you explore today\'s top stories?' }])}
                                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}
                                onMouseOver={(e) => { e.target.style.color = 'white'; e.target.style.borderColor = 'var(--text-muted)'; }}
                                onMouseOut={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)'; }}
                            >
                                Clear
                            </button>
                            <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', opacity: 0.5, fontSize: '24px', color: 'white', transition: '0.2s' }} onMouseOver={(e)=>e.target.style.opacity=1} onMouseOut={(e)=>e.target.style.opacity=0.5}>×</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ 
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                background: m.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                padding: '16px 20px',
                                borderRadius: m.role === 'user' ? '20px 20px 0 20px' : '0 20px 20px 20px',
                                maxWidth: '85%',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: m.role === 'user' ? 'white' : '#cbd5e1',
                                border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: m.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                                overflow: 'hidden'
                            }}>
                                {m.role === 'user' ? (
                                    m.content
                                ) : (
                                    <div 
                                        className="nova-markdown"
                                        dangerouslySetInnerHTML={formatMarkdown(m.content + '\n')} 
                                    />
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '0 20px 20px 20px', fontSize: '13px', color: 'var(--accent)' }}>
                                <span style={{ fontWeight: 700 }}>AI Thinking...</span>
                            </div>
                        )}
                        
                        {!isTyping && messages.length === 1 && (
                            <div style={{ marginTop: '20px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Starts:</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {suggestions.map(s => (
                                        <button key={s} onClick={() => handleSend(s)} style={{ 
                                            background: 'rgba(79, 70, 229, 0.1)', 
                                            border: '1px solid var(--accent)', 
                                            color: 'var(--accent)', 
                                            padding: '8px 12px', 
                                            borderRadius: '8px', 
                                            fontSize: '13px', 
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: '0.2s'
                                        }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '24px', borderTop: '1px solid var(--border)', background: '#12121e', display: 'flex', gap: '12px' }}>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            style={{ flex: 1, background: '#1a1a2e', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                        <button type="submit" style={{ background: 'var(--accent)', border: 'none', borderRadius: '12px', padding: '14px', cursor: 'pointer', boxShadow: '0 4px 12px var(--accent-glow)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default NewsAssistant;
