import React, { useState } from 'react';

const NewsItem = ({ title, detail, imageUrl, more, source, date }) => {
    const [imgError, setImgError] = useState(false);

    // High-quality default news placeholders based on source or just generic
    const defaultImg = "https://images.unsplash.com/photo-1585829365294-18d038555e03?auto=format&fit=crop&q=80&w=800";

    return (
        <div className="news-card-wrapper">
            <div className="news-card" style={{ 
                background: 'var(--bg-card)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'var(--transition)',
                cursor: 'pointer',
                position: 'relative'
            }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: 'auto', minHeight: '150px', background: '#12121e' }}>
                    <img 
                        src={imgError || !imageUrl ? defaultImg : imageUrl} 
                        style={{ 
                            width: '100%', 
                            display: 'block', 
                            height: 'auto',
                            transition: 'transform 0.5s ease'
                        }} 
                        alt="" 
                        onError={() => setImgError(true)}
                        className="card-img-main"
                    />
                    {source && (
                        <span style={{ 
                            position: 'absolute', 
                            top: '12px', 
                            left: '12px', 
                            background: 'rgba(5, 5, 8, 0.9)', 
                            backdropFilter: 'blur(10px)',
                            padding: '4px 10px', 
                            borderRadius: '4px', 
                            fontSize: '9px', 
                            fontWeight: 900,
                            color: 'white',
                            border: '1px solid var(--border)',
                            zIndex: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {source}
                        </span>
                    )}
                </div>
                
                <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Story'}
                    </div>
                    
                    <h3 style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontSize: '17px', 
                        fontWeight: 700, 
                        lineHeight: 1.4, 
                        marginBottom: '10px',
                        color: 'var(--text-primary)'
                    }}>
                        {title}
                    </h3>
                    
                    <p style={{ 
                        fontSize: '13.5px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.5, 
                        marginBottom: '20px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {detail ? detail : "Access the complete coverage and exclusive insights of this breaking development by visiting our verified partner source."}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <a href={more} target="_blank" rel="noreferrer" style={{ 
                            color: 'var(--accent)', 
                            textDecoration: 'none', 
                            fontWeight: 800, 
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            READ ARTICLE
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <style>{`
                .news-card:hover .card-img-main {
                    transform: scale(1.05);
                }
                .news-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--accent);
                    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1);
                }
            `}</style>
        </div>
    );
};

export default NewsItem;