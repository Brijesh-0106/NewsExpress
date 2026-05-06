import React from 'react';
import './App.css';
import NavBar from './components/NavBar';
import MainNews from './components/MainNews';
import Landing from './components/Landing';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  const pageSize = 12; // Adjusted for Pinterest layout
  const country = 'us';
  const favoriteCategory = localStorage.getItem('news_favorite_category') || 'general';

  return (
    <Router>
      <div className="app-wrapper">
        <NavBar />

        <main>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/feed' element={<MainNews key={favoriteCategory} pageSize={pageSize} country={country} category={favoriteCategory} />} />
            <Route path='/business' element={<MainNews key='business' pageSize={pageSize} country={country} category='business' />} />
            <Route path='/entertainment' element={<MainNews key='entertainment' pageSize={pageSize} country={country} category='entertainment' />} />
            <Route path='/health' element={<MainNews key='health' pageSize={pageSize} country={country} category='health' />} />
            <Route path='/science' element={<MainNews key='science' pageSize={pageSize} country={country} category='science' />} />
            <Route path='/sports' element={<MainNews key='sports' pageSize={pageSize} country={country} category='sports' />} />
            <Route path='/technology' element={<MainNews key='technology' pageSize={pageSize} country={country} category='technology' />} />

            {/* Search Route */}
            <Route path='/search' element={<MainNews key='search' pageSize={pageSize} country={country} category='general' />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '80px 40px 60px',
          borderTop: '1px solid var(--border-dim)',
          marginTop: '60px',
          background: 'rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="/favicon.svg" alt="Logo" style={{ width: '24px', height: '24px' }} />
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NewsExpress</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Elevating your news experience through premium design and real-time insights.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
            <span>Privacy</span>
            <span>Policy</span>
            <span>API Docs</span>
            <span>About</span>
          </div>
          <p style={{ marginTop: '30px', fontSize: '11px', color: '#333' }}>
            © {new Date().getFullYear()} NewsExpress. All rights reserved.
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
