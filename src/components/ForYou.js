import React, { useState, useEffect } from 'react';
import NewsItem from './NewsItem';
import { Helmet } from 'react-helmet-async';
import { Settings2, PlusCircle } from 'lucide-react';

const SKELETONS = [1, 2, 3, 4, 5, 6];

const ForYou = ({ user, country, language }) => {
    const allCategories = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    
    // Load saved topics from LocalStorage, default to random two if empty
    const [selectedTopics, setSelectedTopics] = useState(() => {
        const saved = localStorage.getItem('for_you_topics');
        return saved ? JSON.parse(saved) : ['technology', 'business'];
    });
    
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const saveTopics = (topics) => {
        setSelectedTopics(topics);
        localStorage.setItem('for_you_topics', JSON.stringify(topics));
    };

    const toggleTopic = (topic) => {
        let newTopics;
        if (selectedTopics.includes(topic)) {
            newTopics = selectedTopics.filter(t => t !== topic);
            if (newTopics.length === 0) return; // Prevent empty selection
        } else {
            newTopics = [...selectedTopics, topic];
        }
        saveTopics(newTopics);
    };

    useEffect(() => {
        const loadMixedNews = async () => {
            setLoading(true);
            try {
                const apiKey = 'pub_1bbce5ce88d447c4a12a4869bb50523f';
                
                // Fetch for each selected topic concurrently
                const fetchPromises = selectedTopics.map(topic => {
                    let url = `https://newsdata.io/api/1/news?apikey=${apiKey}&image=1&size=5&category=${topic}`;
                    if (country) url += `&country=${country}`;
                    if (language) url += `&language=${language}`;
                    return fetch(url).then(res => res.json());
                });

                const results = await Promise.all(fetchPromises);
                
                let mixedArticles = [];
                results.forEach((parsedData, index) => {
                    const topic = selectedTopics[index];
                    if (parsedData.status === "success" && parsedData.results) {
                        const mapped = parsedData.results.map(item => ({
                            title: item.title,
                            description: item.description,
                            url: item.link,
                            urlToImage: item.image_url,
                            publishedAt: item.pubDate,
                            source: { name: item.source_id },
                            _topic: topic // internal tag
                        }));
                        mixedArticles = [...mixedArticles, ...mapped];
                    }
                });

                // Shuffle the mixed articles for a diverse feed
                mixedArticles.sort(() => 0.5 - Math.random());
                setArticles(mixedArticles);
                
            } catch (error) {
                console.error("Error fetching mixed news:", error);
            }
            setLoading(false);
        };

        if (!isConfiguring) {
            loadMixedNews();
        }
    }, [selectedTopics, country, language, isConfiguring]);

    return (
        <div style={{ marginTop: '40px', minHeight: '80vh' }}>
            <Helmet>
                <title>For You | NewsExpress</title>
            </Helmet>

            <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '15px' }}>
                    <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>For You</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', maxWidth: '600px', margin: '0 auto 25px' }}>
                    A personalized feed curated from your favorite topics.
                </p>
                
                <button 
                    onClick={() => setIsConfiguring(!isConfiguring)}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                    }}
                >
                    <Settings2 size={18} />
                    {isConfiguring ? 'Done Configuring' : 'Manage Topics'}
                </button>
            </div>

            {isConfiguring && (
                <div className="container" style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-dim)', marginBottom: '40px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Select your interests:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {allCategories.map(cat => {
                            const isSelected = selectedTopics.includes(cat);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => toggleTopic(cat)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '30px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        background: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {isSelected ? '✓' : <PlusCircle size={16} />} {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!isConfiguring && (
                <div className="container">
                    {loading ? (
                        <div className="news-grid">
                            {SKELETONS.map(i => (
                                <div key={i} className="news-card-wrapper">
                                    <div className="news-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '0', overflow: 'hidden' }}>
                                        <div style={{ width: '100%', height: '220px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
                                    </div>
                                </div>
                            ))}
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
                                    source={element.source?.name}
                                    date={element.publishedAt}
                                    user={user}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ForYou;
