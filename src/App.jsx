import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="glow-bg"></div>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
