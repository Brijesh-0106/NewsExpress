import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsItem from './NewsItem';
import NewsAssistant from './NewsAssistant';
import { sendWelcomeEmail } from '../services/EmailService';

const SkeletonCard = () => (
    <div className="news-card-wrapper" style={{ position: 'relative' }}>
        <div className="news-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '0', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '220px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ padding: '20px' }}>
                <div style={{ width: '30%', height: '12px', background: 'rgba(255,255,255,0.03)', marginBottom: '15px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.05)', marginBottom: '10px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            </div>
        </div>
    </div>
);

const SubscriptionModal = ({ isOpen, onClose, email, setEmail, status, onSubscribe }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>✕</button>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--accent-glow)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 25px',
                        border: '1px solid var(--accent)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, marginBottom: '15px', color: 'white' }}>
                        Morning <span style={{ color: 'var(--accent)' }}>Digest</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
                        Join 100,000+ readers. Get the most important stories delivered to your inbox every morning for free.
                    </p>
                    <form onSubmit={onSubscribe} className="subscription-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="modal-input"
                            required
                        />
                        <button type="submit" className="sub-btn" style={{ height: '56px', width: '100%' }}>
                            {status === "loading" ? "Processing..." : "Subscribe Now"}
                        </button>
                    </form>
                    {status === "success" && (
                        <p style={{ marginTop: '20px', color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>
                            ✓ Welcome! Check your inbox soon.
                        </p>
                    )}
                    {status === "error" && (
                        <p style={{ marginTop: '20px', color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>
                            ! Error sending email. Please try again later.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const MainNews = ({ country, category, pageSize }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [subEmail, setSubEmail] = useState("");
    const [subStatus, setSubStatus] = useState(null);
    const [searchParams] = useSearchParams();
    const observerTarget = useRef(null);

    const searchQuery = searchParams.get('q');

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            let url;
            if (searchQuery) {
                url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&searchIn=title,description&sortBy=relevancy&page=${page}&pageSize=${pageSize}&apiKey=9b8e226f60a74866aa4af26f6622f07a&cb=${Date.now()}`;
            } else {
                url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=9b8e226f60a74866aa4af26f6622f07a&cb=${Date.now()}`;
            }

            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const parsedData = await response.json();

            if (parsedData.status === "ok") {
                const filtered = searchQuery
                    ? (parsedData.articles || []).filter(art =>
                        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        art.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                    : (parsedData.articles || []);

                setArticles(prev => page === 1 ? filtered : [...prev, ...filtered]);
                setTotalResults(parsedData.totalResults || 0);
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        }
        setLoading(false);
    }, [country, category, page, pageSize, searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [category, searchQuery]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    useEffect(() => {
        const currentTarget = observerTarget.current;
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && articles.length < totalResults) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [loading, articles.length, totalResults]);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!subEmail) return;
        setSubStatus("loading");

        const success = await sendWelcomeEmail(subEmail, articles);

        if (success) {
            setSubStatus("success");
            setSubEmail("");
        } else {
            setSubStatus("error");
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    return (
        <div style={{ marginTop: '40px' }}>
            {/* AI Assistant Integration */}
            <NewsAssistant articles={articles} />

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                email={subEmail}
                setEmail={setSubEmail}
                status={subStatus}
                onSubscribe={handleSubscribe}
            />

            <div className="container" style={{ textAlign: 'center', marginBottom: '60px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>
                    {searchQuery ? "Direct Results" : "Top Stories"}
                </span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, marginTop: '10px', marginBottom: '20px' }}>
                    {searchQuery ? `"${searchQuery}"` : (category === 'general' && !localStorage.getItem('news_favorite_category') ? 'Headlines' : capitalize(category))}
                </h1>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="sub-btn"
                    style={{
                        fontSize: '14px',
                        padding: '12px 24px',
                        borderRadius: '100px',
                        background: 'rgba(79, 70, 229, 0.1)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        boxShadow: 'none'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Subscribe to Digest
                </button>
            </div>

            {searchQuery && articles.length > 0 && (
                <div style={{ maxWidth: '800px', margin: '0 auto 40px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid var(--accent)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', color: 'white', fontWeight: 700, margin: '0 0 5px' }}>✨ Deep Search with NOVA AI</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Ask our AI assistant to summarize or find specific insights about "{searchQuery}".</p>
                    </div>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: `Summarize articles related to ${searchQuery}` }))} className="live-btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>
                        Ask AI
                    </button>
                </div>
            )}

            {loading && page === 1 ? (
                <div className="news-grid" style={{ paddingTop: '20px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <>
                    {articles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <h2 style={{ color: 'var(--text-secondary)' }}>No precise matches found. Try another term.</h2>
                        </div>
                    ) : (
                        <div className="news-grid">
                            {articles.map((element, index) => (
                                <NewsItem
                                    key={element.url + index}
                                    title={element.title}
                                    detail={element.description}
                                    imageUrl={element.urlToImage}
                                    more={element.url}
                                    source={element.source.name}
                                    date={element.publishedAt}
                                    onAskAI={(articleData) => {
                                        window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { action: 'context', data: articleData } }));
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Infinite Scroll Observer Target */}
                    {articles.length > 0 && articles.length < totalResults && (
                        <div ref={observerTarget} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></div>
                        </div>
                    )}
                </>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MainNews;
