import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CarFront, Trophy, Calendar, User, LogOut, MessageSquare, LayoutGrid, Timer, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="top-nav">
      <div className="nav-content">
        <NavLink to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <CarFront size={28} />
          CAR<span>MANAGER</span>
        </NavLink>

        {/* Hamburger Toggle */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <LayoutGrid size={16} /> INÍCIO
          </NavLink>
          <NavLink to="/ranking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <Trophy size={16} /> RANKING
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <Calendar size={16} /> EVENTOS
          </NavLink>
          <NavLink to="/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <MessageSquare size={16} /> COMUNIDADE
          </NavLink>
          
          {/* Profile link inside mobile menu */}
          <NavLink to="/profile" className={({ isActive }) => `nav-link nav-profile-mobile ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <User size={16} /> {user?.name || 'Perfil'}
          </NavLink>
        </div>

        <div className="nav-profile-desktop">
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
