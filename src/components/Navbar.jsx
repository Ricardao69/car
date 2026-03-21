import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CarFront, Trophy, Calendar, User, LogOut, MessageSquare, LayoutGrid, Timer } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="top-nav">
      <div className="nav-content">
        <NavLink to="/" className="logo">
          <CarFront size={28} />
          CAR<span>MANAGER</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/garage" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutGrid size={16} /> GARAGEM
          </NavLink>
          <NavLink to="/laptimes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Timer size={16} /> TELEMETRIA
          </NavLink>
          <NavLink to="/ranking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Trophy size={16} /> RANKING
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={16} /> EVENTOS
          </NavLink>
          <NavLink to="/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={16} /> PADDOCK
          </NavLink>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />
          
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} />
            {user?.name || 'Perfil'}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
