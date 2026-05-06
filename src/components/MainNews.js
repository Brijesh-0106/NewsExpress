import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsItem from './NewsItem';
import NewsAssistant from './NewsAssistant';
import { sendWelcomeEmail } from '../services/EmailService';

const MainNews = ({ country, category, pageSize }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [subEmail, setSubEmail] = useState("");
    const [subStatus, setSubStatus] = useState(null);
    const [searchParams] = useSearchParams();
    
    const searchQuery = searchParams.get('q');

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            let url;
            if (searchQuery) {
                url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&searchIn=title,description&sortBy=relevancy&page=${page}&pageSize=${pageSize}&apiKey=b57993e36b9748e381c44cca8b6c025a`;
            } else {
                url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=b57993e36b9748e381c44cca8b6c025a`;
            }

            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const parsedData = await response.json();

            if (parsedData.status === "ok") {
                const filtered = searchQuery 
                    ? (parsedData.articles || []).filter(art => 
                        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        art.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                    : (parsedData.articles || []);
                
                setArticles(filtered);
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
        window.scrollTo(0, 0);
    }, [fetchNews]);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!subEmail) return;
        setSubStatus("loading");
        
        // --- REAL EMAIL IMPLEMENTATION ---
        // Sends top 5 headlines as requested
        const success = await sendWelcomeEmail(subEmail, articles);
        
        if (success) {
            setSubStatus("success");
            setSubEmail("");
        } else {
            setSubStatus("error");
        }
    };

    const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    return (
        <div style={{ marginTop: '40px' }}>
            {/* AI Assistant Integration */}
            <NewsAssistant articles={articles} />

            <div className="container" style={{ textAlign: 'center', marginBottom: '60px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>
                    {searchQuery ? "Direct Results" : "Top Stories"}
                </span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, marginTop: '10px' }}>
                    {searchQuery ? `"${searchQuery}"` : (category === 'general' ? 'Headlines' : capitalize(category))}
                </h1>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></div>
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
                                    onAskAI={(query) => {
                                        // Need to trigger the NewsAssistant.
                                        // A quick way is to emit a custom event.
                                        window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: query }));
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {totalResults > pageSize && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingBottom: '60px' }}>
                            <button disabled={page <= 1} className="live-btn" onClick={() => setPage(page - 1)}>Previous</button>
                            <button disabled={page >= Math.ceil(totalResults / pageSize)} className="live-btn" onClick={() => setPage(page + 1)}>Next</button>
                        </div>
                    )}

                    {/* Subscription Section */}
                    <div style={{ 
                        maxWidth: '1200px', 
                        margin: '80px auto', 
                        padding: '60px 40px', 
                        background: 'linear-gradient(135deg, #12121e 0%, #050508 100%)', 
                        borderRadius: '30px',
                        border: '1px solid var(--border)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, marginBottom: '15px' }}>
                            Morning <span style={{ color: 'var(--accent)' }}>Digest</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 30px' }}>
                            Get the most important stories of the day delivered to your inbox every morning for free.
                        </p>
                        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '15px', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={subEmail}
                                onChange={(e) => setSubEmail(e.target.value)}
                                style={{ flex: 1, padding: '15px 20px', borderRadius: '15px', border: '1px solid var(--border)', background: '#050508', color: 'white', outline: 'none' }}
                                required
                            />
                            <button type="submit" className="live-btn" style={{ padding: '0 30px', background: 'var(--accent)', borderColor: 'var(--accent)' }}>
                                {subStatus === "loading" ? "..." : "Subscribe"}
                            </button>
                        </form>
                        {subStatus === "success" && (
                            <p style={{ marginTop: '20px', color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>
                                ✓ Subscription successful! Welcome email sent.
                            </p>
                        )}
                        {subStatus === "error" && (
                            <p style={{ marginTop: '20px', color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>
                                ! Error sending email. Check console or EmailService.js config.
                            </p>
                        )}
                    </div>
                </>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MainNews;