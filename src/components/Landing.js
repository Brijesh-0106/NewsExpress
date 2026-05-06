import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const stats = [
        { label: 'Articles Analyzed', value: '50,000+' },
        { label: 'AI Responses Generated', value: '1.2M' },
        { label: 'Active Readers', value: '100K+' },
    ];

    const features = [
        {
            icon: '✨',
            title: 'NOVA AI Assistant',
            description: 'Your personal news anchor that summarizes, explains, and connects the dots across global headlines.'
        },
        {
            icon: '🔍',
            title: 'Semantic Intelligence',
            description: 'Search by meaning, not just keywords. Find deep insights hidden within thousands of stories.'
        },
        {
            icon: '💎',
            title: 'Dark Luxury Design',
            description: 'A premium, distraction-free interface engineered for the modern reader who values aesthetics.'
        },
        {
            icon: '⚡',
            title: 'Real-time Processing',
            description: 'Experience lightning-fast updates and AI-driven analysis as news breaks across the globe.'
        },
        {
            icon: '📱',
            title: 'Adaptive Experience',
            description: 'Seamlessly transition between desktop and mobile with a fluid, responsive architectural design.'
        },
        {
            icon: '✉️',
            title: 'Curated Digests',
            description: 'Wake up to a personalized morning digest that highlights only what truly matters to you.'
        }
    ];

    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="hero-section">

                <h1 className="hero-title">
                    The Future of News <br />
                    <span className="accent-text">Redefined by Intelligence</span>
                </h1>
                <p className="hero-subtitle">
                    NewsExpress is a high-performance AI news platform that transforms raw headlines 
                    into actionable insights. Experience the next generation of digital journalism.
                </p>
                <div className="hero-btns">
                    <Link to="/feed" className="primary-btn">Start Reading</Link>
                    <a href="#features" className="secondary-btn">Explore Features</a>
                </div>
                
                {/* Product Preview */}
                <div className="product-preview">
                    <div className="preview-glow"></div>
                    <img 
                        src="/preview-mockup.png" 
                        alt="NewsExpress Interface" 
                        className="preview-img"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'} 
                    />
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card">
                            <h2 className="stat-value">{stat.value}</h2>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Engineered for Excellence</h2>
                    <p className="section-subtitle">Everything you need to stay ahead of the curve in a fast-paced world.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to elevate your news experience?</h2>
                    <p className="cta-subtitle">Join thousands of readers who are already using NewsExpress to stay informed better and faster.</p>
                    <Link to="/feed" className="primary-btn">Get Started for Free</Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;
