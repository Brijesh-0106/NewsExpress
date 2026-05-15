import React, { useState } from 'react';
import { supabase } from '../services/SupabaseService';
import { BookmarkPlus, BookmarkCheck, Share2, Twitter, Linkedin, Clock, LogIn } from 'lucide-react';

const NewsItem = ({ title, detail, imageUrl, more, source, date, onAskAI, user, isBookmarked = false, onBookmarkChange }) => {
    const [imgError, setImgError] = useState(false);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [showShare, setShowShare] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // High-quality default news placeholders based on source or just generic
    const defaultImg = "https://images.unsplash.com/photo-1585829365294-18d038555e03?auto=format&fit=crop&q=80&w=800";

    const calculateReadTime = (text) => {
        const wordsPerMinute = 200;
        const words = (text || "").split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute) + 1; // Base 1 min + content
        return `${minutes} min read`;
    };

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            showToast('Please login to save articles!', 'login');
            return;
        }

        try {
            if (bookmarked) {
                // If it was passed an onBookmarkChange from the Bookmarks page, call it
                if (onBookmarkChange) {
                    onBookmarkChange();
                } else {
                    // Otherwise try to delete by matching user_id and url
                    await supabase.from('bookmarks').delete().match({ user_id: user.id, article_url: more });
                }
                setBookmarked(false);
            } else {
                const { error } = await supabase.from('bookmarks').insert({
                    user_id: user.id,
                    article_title: title,
                    article_description: detail,
                    article_url: more,
                    article_image: imageUrl || defaultImg,
                    article_source: source,
                    article_published_at: date
                });
                if (error) throw error;
                setBookmarked(true);
            }
        } catch (error) {
            console.error("Error bookmarking:", error);
        }
    };

    const toggleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowShare(!showShare);
    };

    const shareUrl = encodeURIComponent(more);
    const shareTitle = encodeURIComponent(`Check out this news: ${title}`);

    return (
        <div className="news-card-wrapper" style={{ position: 'relative' }}>
            <div className="news-card" style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
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

                    {/* AI Ask Button (shows on hover via CSS) */}
                    {onAskAI && (
                        <button
                            className="ask-ai-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAskAI({ title, detail, source, date });
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            Ask AI
                        </button>
                    )}
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Story'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            <Clock size={12} /> {calculateReadTime(detail)}
                        </div>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
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

                        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                            <button onClick={toggleShare} className="action-btn" title="Share">
                                <Share2 size={18} />
                            </button>
                            
                            {showShare && (
                                <div className="share-menu">
                                    <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noreferrer" className="share-item">
                                        <Twitter size={16} /> Twitter
                                    </a>
                                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" className="share-item">
                                        <Linkedin size={16} /> LinkedIn
                                    </a>
                                </div>
                            )}

                            <button onClick={handleBookmark} className="action-btn" title={bookmarked ? "Remove Bookmark" : "Save for Later"} style={{ color: bookmarked ? 'var(--accent)' : 'inherit' }}>
                                {bookmarked ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px solid rgba(79, 70, 229, 0.4)',
                    borderRadius: '14px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(79,70,229,0.15)',
                    animation: 'toastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    minWidth: '260px',
                    maxWidth: '340px'
                }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'rgba(79, 70, 229, 0.2)',
                        border: '1px solid rgba(79,70,229,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <LogIn size={16} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '2px' }}>Login Required</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{toast.message}</div>
                    </div>
                    <button onClick={() => setToast(null)} style={{
                        background: 'transparent', border: 'none', color: '#64748b',
                        cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                        borderRadius: '6px', transition: 'color 0.2s'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            )}

            <style>{`
                .action-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    padding: 4px;
                }
                .action-btn:hover {
                    color: var(--text-primary);
                    transform: scale(1.1);
                }
                .share-menu {
                    position: absolute;
                    bottom: 30px;
                    right: 30px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-dim);
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    z-index: 20;
                    animation: fadeIn 0.2s ease;
                }
                .share-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-primary);
                    text-decoration: none;
                    font-size: 13px;
                    padding: 6px 12px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .share-item:hover {
                    background: rgba(255,255,255,0.05);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes toastSlideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .news-card-wrapper .ask-ai-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    opacity: 0;
                    transform: translateY(-5px);
                    transition: all 0.2s ease;
                    z-index: 10;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }
                .news-card-wrapper:hover .ask-ai-btn {
                    opacity: 1;
                    transform: translateY(0);
                }
                .news-card-wrapper .ask-ai-btn:hover {
                    background: white;
                    color: var(--accent);
                }
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
