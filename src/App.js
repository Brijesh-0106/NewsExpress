import React from 'react';
import './App.css';
import NavBar from './components/NavBar';
import MainNews from './components/MainNews';
import Landing from './components/Landing';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from './services/SupabaseService';
import Bookmarks from './components/Bookmarks';
import ForYou from './components/ForYou';
import { Helmet } from 'react-helmet-async';

const App = () => {
  const pageSize = 12; // Adjusted for Pinterest layout
  const [country, setCountry] = React.useState('us');
  const [language, setLanguage] = React.useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <Router>
      <div className="app-wrapper">
        <Helmet>
          <title>NewsExpress | Premium Dark Luxury News</title>
          <meta name="description" content="A premium, AI-driven news experience tailored to your interests." />
        </Helmet>
        <NavBar user={user} onCountryChange={setCountry} currentCountry={country} onLanguageChange={setLanguage} currentLanguage={language} />

        <main>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/feed' element={<MainNews user={user} key={`general-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='general' />} />
            <Route path='/business' element={<MainNews user={user} key={`business-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='business' />} />
            <Route path='/entertainment' element={<MainNews user={user} key={`entertainment-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='entertainment' />} />
            <Route path='/health' element={<MainNews user={user} key={`health-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='health' />} />
            <Route path='/science' element={<MainNews user={user} key={`science-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='science' />} />
            <Route path='/sports' element={<MainNews user={user} key={`sports-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='sports' />} />
            <Route path='/technology' element={<MainNews user={user} key={`technology-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='technology' />} />

            {/* Search Route */}
            <Route path='/search' element={<MainNews user={user} key={`search-${country}-${language}`} pageSize={pageSize} country={country} language={language} category='general' />} />
            
            {/* New Routes */}
            <Route path='/bookmarks' element={user ? <Bookmarks user={user} /> : <Navigate to="/" />} />
            <Route path='/foryou' element={<ForYou user={user} pageSize={pageSize} country={country} language={language} />} />
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
