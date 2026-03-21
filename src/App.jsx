import React, { useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Garage from './pages/Garage';
import LapTimes from './pages/LapTimes';
import Ranking from './pages/Ranking';
import Events from './pages/Events';
import Feed from './pages/Feed';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/garage" element={<Garage />} />
      <Route path="/laptimes" element={<LapTimes />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/events" element={<Events />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return (
    <AuthProvider>
      <MemoryRouter>
        <div className="glow-bg"></div>
        <Navbar />
        <div className="page-container">
          <AppRoutes />
        </div>
      </MemoryRouter>
    </AuthProvider>
  );
}

export default App;
