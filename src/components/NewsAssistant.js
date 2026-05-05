import React, { useState, useRef, useEffect } from 'react';
import RAGService from '../services/RAGService';

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
        const indexData = async () => {
            if (articles.length > 0) {
                const vectors = await RAGService.indexArticles(articles);
                setLocalVectors(vectors);
            }
        };
        indexData();
    }, [articles]);

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
            const matches = await RAGService.search(query, localVectors);
            let response;
            if (matches.length > 0) {
                response = `Analysis complete. Found a strong semantic match: "${matches[0].title}". \n\nKey Insights: ${matches[0].content}`;
            } else {
                response = "I've analyzed the vector space but couldn't find a direct match. Try asking about a different topic or category.";
            }
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Vector engine error. Please refresh and try again." }]);
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
                    <div style={{ background: '#12121e', padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent)' }}></div>
                            <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Intelligence Hub</span>
                        </div>
                        <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', opacity: 0.5, fontSize: '24px' }}>×</span>
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
                                border: m.role === 'user' ? 'none' : '1px solid var(--border)'
                            }}>
                                {m.content}
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
