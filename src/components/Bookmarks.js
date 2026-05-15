import React, { useState, useEffect } from 'react';
import NewsItem from './NewsItem';
import { supabase } from '../services/SupabaseService';
import { Helmet } from 'react-helmet-async';
import { BookmarkX } from 'lucide-react';

const Bookmarks = ({ user }) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            // Map the db columns to the NewsItem props format
            const formatted = data.map(b => ({
                title: b.article_title,
                description: b.article_description,
                url: b.article_url,
                urlToImage: b.article_image,
                source: { name: b.article_source },
                publishedAt: b.article_published_at,
                id: b.id // Keep bookmark ID for easy removal
            }));
            
            setBookmarks(formatted);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookmarks();
        }
        // eslint-disable-next-line
    }, [user]);

    const handleRemoveBookmark = async (id) => {
        try {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            setBookmarks(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    return (
        <>
            <Helmet>
                <title>My Bookmarks | NewsExpress</title>
            </Helmet>
            
            <div className="container" style={{ paddingTop: '100px', minHeight: '80vh' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                        Read <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Later</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Your curated collection of saved articles.</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <img src="/loading2.gif" alt="loading" className="loading-spinner" />
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
                        <BookmarkX size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <h3>No bookmarks yet</h3>
                        <p>Articles you save will appear here.</p>
                    </div>
                ) : (
                    <div className="news-grid">
                        {bookmarks.map((element, index) => (
                            <div key={element.id || index}>
                                <NewsItem 
                                    title={element.title} 
                                    detail={element.description} 
                                    imageUrl={element.urlToImage} 
                                    more={element.url} 
                                    source={element.source?.name} 
                                    date={element.publishedAt}
                                    user={user}
                                    isBookmarked={true}
                                    onBookmarkChange={() => handleRemoveBookmark(element.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Bookmarks;
