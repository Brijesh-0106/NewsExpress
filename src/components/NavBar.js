import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/SupabaseService';
import { LogOut, Bookmark, User, Star } from 'lucide-react';

const NavBar = ({ user, onCountryChange, currentCountry, onLanguageChange, currentLanguage }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) {
            setSearchQuery(q);
        } else {
            setSearchQuery("");
        }
    }, [location.search]);

    const categories = [
        { name: 'Top Stories', path: '/feed' },
        { name: 'Business', path: '/business' },
        { name: 'Entertainment', path: '/entertainment' },
        { name: 'Health', path: '/health' },
        { name: 'Science', path: '/science' },
        { name: 'Sports', path: '/sports' },
        { name: 'Technology', path: '/technology' },
    ];

    const countries = [
        { code: 'us', name: 'USA' },
        { code: 'in', name: 'India' },
        { code: 'gb', name: 'UK' },
        { code: 'ca', name: 'Canada' },
        { code: 'au', name: 'Australia' },
    ];

    const languages = [
        { code: '', name: 'All' },
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'gu', name: 'Gujarati' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ar', name: 'Arabic' },
        { code: 'jp', name: 'Japanese' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        navigate('/feed');
    };

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) console.error('Login error:', error.message);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error.message);
        navigate('/');
    };

    return (
        <div className="navbar-wrapper">
            <nav className="modern-nav">
                <Link className="nav-brand" to="/">
                    <img src="/favicon.svg" alt="Logo" style={{ width: '28px', height: '28px' }} />
                    NewsExpress
                </Link>

                <ul className="nav-links">
                    <li>
                        <Link className={`nav-link ${location.pathname === '/foryou' ? 'active' : ''}`} to="/foryou">
                            <Star size={14} /> For You
                        </Link>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.path}>
                            <Link
                                className={`nav-link ${location.pathname === cat.path ? 'active' : ''}`}
                                to={cat.path}
                            >
                                {cat.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="nav-actions">
                    <div className="search-container">
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="country-select"
                                value={currentCountry}
                                onChange={(e) => onCountryChange(e.target.value)}
                            >
                                {countries.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>

                            <select
                                className="country-select"
                                value={currentLanguage}
                                onChange={(e) => onLanguageChange(e.target.value)}
                            >
                                {languages.map(l => (
                                    <option key={l.code} value={l.code}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        <form onSubmit={handleSearch} className="search-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="auth-container">
                        {user ? (
                            <>
                                <Link to="/bookmarks" className="icon-btn" title="Bookmarks" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex' }}>
                                    <Bookmark size={20} />
                                </Link>
                                <button onClick={handleLogout} className="icon-btn" title="Logout" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                                    <LogOut size={20} />
                                </button>
                                <img src={user.user_metadata?.avatar_url || '/favicon.svg'} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--accent)', objectFit: 'cover' }} />
                            </>
                        ) : (
                            <button onClick={handleLogin} style={{
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px var(--accent-glow)'
                            }}>
                                <User size={16} /> Login
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;
