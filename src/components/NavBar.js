import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavBar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const categories = [
        { name: 'General', path: '/' },
        { name: 'Business', path: '/business' },
        { name: 'Entertainment', path: '/entertainment' },
        { name: 'Health', path: '/health' },
        { name: 'Science', path: '/science' },
        { name: 'Sports', path: '/sports' },
        { name: 'Technology', path: '/technology' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    const handleLiveUpdates = () => {
        const btn = document.getElementById('live-btn');
        btn.innerText = "Checking...";
        setTimeout(() => {
            btn.innerText = "No New Alerts";
            setTimeout(() => {
                btn.innerText = "Live Updates";
            }, 2000);
        }, 1500);
    };

    return (
        <div className="navbar-wrapper">
            <nav className="modern-nav">
                <Link className="nav-brand" to="/">NewsExpress</Link>
                
                <ul className="nav-links">
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

                <div className="search-container">
                    <form onSubmit={handleSearch} className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search topics..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <button id="live-btn" className="live-btn" onClick={handleLiveUpdates}>
                        Live Updates
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;
