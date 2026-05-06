import React, { useState, useRef, useEffect } from 'react';
import { indexArticles } from '../services/RAGService';

// Memoized component to stop typing from lagging out the entire chat
const MessageItem = React.memo(({ message }) => {
    // Don't render an empty assistant bubble while waiting for stream
    if (!message.content && message.role === 'assistant') return null;

    // Robust Markdown Parser
    const formatMarkdown = (text) => {
        if (!text) return { __html: '' };
        
        // Escape HTML
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Remove standalone hashes that AI sometimes outputs
        html = html.replace(/^#+\s*$/gim, '');

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 style="color:var(--accent); font-size:1.1rem; font-weight:800; margin: 20px 0 10px 0; text-transform:uppercase; letter-spacing:1px">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 style="color:white; font-size:1.4rem; font-weight:900; margin-bottom:15px; margin-top:20px; display:flex; align-items:center; gap:8px">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 style="color:white; font-size:1.6rem; font-weight:900; margin-bottom:15px">$1</h1>');
        
        // Blockquote
        html = html.replace(/^&gt; (.*$)/gim, '<blockquote style="border-left: 4px solid var(--accent); padding-left: 15px; margin: 15px 0; font-style: italic; color: #a1a1aa; font-size: 1.1rem; line-height: 1.6; background: rgba(79, 70, 229, 0.05); padding-top: 10px; padding-bottom: 10px; border-radius: 0 8px 8px 0">$1</blockquote>');
        
        // Horizontal Rule
        html = html.replace(/^---$/gim, '<hr style="border:0; height:1px; background:linear-gradient(90deg, transparent, var(--accent), transparent); opacity:0.3; margin:25px 0" />');
        
        // Bold & Italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:white; font-weight:800">$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em style="color:#cbd5e1">$1</em>');
        
        // Line-by-line processing for lists and paragraphs
        let lines = html.split('\n');
        let inList = false;
        let newHtml = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            if (line.startsWith('- ')) {
                if (!inList) {
                    newHtml += '<ul style="list-style:none; padding:0; margin: 15px 0">\n';
                    inList = true;
                }
                newHtml += '<li style="margin-bottom: 8px; line-height: 1.6; position:relative; padding-left:20px"><span style="position:absolute; left:0; color:var(--accent)">•</span>' + line.substring(2) + '</li>\n';
            } else {
                if (inList) {
                    newHtml += '</ul>\n';
                    inList = false;
                }
                if (line === '') {
                    // Empty line
                } else if (line.startsWith('<h') || line.startsWith('<b') || line.startsWith('<hr')) {
                    newHtml += line + '\n';
                } else {
                    newHtml += `<p style="margin-bottom: 15px; line-height: 1.7; color: #cbd5e1">${line}</p>\n`;
                }
            }
        }
        if (inList) newHtml += '</ul>\n';
        
        return { __html: newHtml };
    };

    return (
        <div style={{ 
            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            background: message.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
            padding: message.role === 'user' ? '14px 18px' : '20px 24px',
            borderRadius: message.role === 'user' ? '20px 20px 0 20px' : '0 20px 20px 20px',
            maxWidth: message.role === 'user' ? '85%' : '100%',
            width: message.role === 'user' ? 'auto' : '100%',
            fontSize: '15px',
            lineHeight: '1.6',
            color: message.role === 'user' ? 'white' : '#cbd5e1',
            border: message.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: message.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
            flexShrink: 0
        }}>
            {message.role === 'user' ? (
                message.content
            ) : (
                <div dangerouslySetInnerHTML={formatMarkdown(message.content)} />
            )}
        </div>
    );
});

const NewsAssistant = ({ articles }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am your AI News Assistant. I have semantically indexed today\'s stories. How can I help you explore them?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [localVectors, setLocalVectors] = useState([]);
    const [contextArticle, setContextArticle] = useState(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const suggestions = [
        "Summarize today's top stories",
        "Find news about technology",
        "Who are the key people in the news?",
    ];

    useEffect(() => {
        const handleOpenChat = (e) => {
            setIsOpen(true);
            if (e.detail) {
                if (e.detail.action === 'context') {
                    setContextArticle(e.detail.data);
                } else if (typeof e.detail === 'string') {
                    setTimeout(() => {
                        handleSend(e.detail);
                    }, 300);
                }
            }
        };

        window.addEventListener('open-ai-chat', handleOpenChat);
        return () => window.removeEventListener('open-ai-chat', handleOpenChat);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleScroll = (e) => {
        const container = e.target;
        // If user scrolls up, disable auto-scroll. If they scroll back down, enable it.
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        setAutoScroll(isNearBottom);
    };

    useEffect(() => {
        if (autoScroll && chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                // Use 'auto' during typing to prevent smooth-scroll lag/stuttering
                behavior: isTyping ? 'auto' : 'smooth' 
            });
        }
    }, [messages, isTyping, autoScroll]);

    const handleSend = async (text) => {
        const query = text || input;
        if (!query.trim()) return;

        setAutoScroll(true); // Force scroll on new message
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setInput('');
        setIsTyping(true);

        try {
            const { searchNews, generateAnswerStream } = await import('../services/RAGService');
            
            // Capture context and clear it immediately so it doesn't linger
            const currentContext = contextArticle;
            setContextArticle(null);

            // If we have a specific article context, use it exclusively
            const matches = currentContext 
                ? [{ title: currentContext.title, content: currentContext.detail, source: currentContext.source, date: currentContext.date }]
                : await searchNews(query, localVectors);
            
            if (matches.length > 0) {
                // Add empty message to stream into
                setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
                
                await generateAnswerStream(query, matches, (chunk) => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        // Replace the object to trigger React.memo re-render on the last item only
                        newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: chunk };
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
                    top: 0,
                    right: 0,
                    width: '500px',
                    height: '100vh',
                    background: '#0c0c12',
                    borderLeft: '1px solid var(--border)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
                    animation: 'slideInRight 0.3s ease forwards'
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

                    <div ref={chatContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {messages.map((m, i) => (
                            <MessageItem key={i} message={m} />
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '0 20px 20px 20px', fontSize: '13px', color: 'var(--accent)', flexShrink: 0 }}>
                                <span style={{ fontWeight: 700 }}>AI Thinking...</span>
                            </div>
                        )}
                        
                        {!isTyping && messages.length === 1 && (
                            <div style={{ marginTop: '20px', flexShrink: 0 }}>
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

                    {contextArticle && (
                        <div style={{ padding: '12px 24px', background: 'rgba(79, 70, 229, 0.1)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'var(--accent)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '10px' }}>
                                <span style={{ fontWeight: 800 }}>Asking about:</span> {contextArticle.title}
                            </div>
                            <button type="button" onClick={() => setContextArticle(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', opacity: 0.7 }}>×</button>
                        </div>
                    )}
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
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
};

export default NewsAssistant;
