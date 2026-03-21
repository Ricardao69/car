import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CarFront, Trophy, Calendar, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="top-nav">
      <div className="nav-content">
        <NavLink to="/" className="logo">
          <CarFront size={28} />
          CAR<span>MANAGER</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/garage" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Garagem
          </NavLink>
          <NavLink to="/laptimes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Tempos de Volta
          </NavLink>
          <NavLink to="/ranking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Ranking
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Eventos
          </NavLink>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />
          
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} />
            {user?.name || 'Perfil'}
          </NavLink>
          
          <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', hover: { color: 'var(--danger)' } }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
