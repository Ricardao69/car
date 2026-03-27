import React, { useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import SpeedLines from './components/SpeedLines';
import Profile from './pages/Profile';
import Garage from './pages/Garage';
import LapTimes from './pages/LapTimes';
import Ranking from './pages/Ranking';
import Events from './pages/Events';
import Feed from './pages/Feed';
import Home from './pages/Home';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/events" element={<Events />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
      <ToastProvider>
        <MemoryRouter>
          <SpeedLines />
          <Navbar />
          <div className="page-container">
            <AppRoutes />
          </div>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

