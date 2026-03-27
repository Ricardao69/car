import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGarage } from '../hooks/useGarage';
import { useLapTimes } from '../hooks/useLapTimes';
import { useToast } from '../components/Toast';
import { Camera, Save, BadgeCheck, Clock, LogOut, Calendar, Trophy, Car, ShieldCheck, LayoutGrid, User as UserIcon } from 'lucide-react';
import Garage from './Garage';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const { cars } = useGarage();
  const { lapTimes } = useLapTimes();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState(user.name);
  const [cnhStatus, setCnhStatus] = useState(user.cnhStatus || 'Provisória');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'garage'
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Derived stats
  const bestLap = lapTimes.length > 0 ? [...lapTimes].sort((a,b) => a.totalMillis - b.totalMillis)[0] : null;
  const favoriteTrack = lapTimes.length > 0 
    ? Object.entries(lapTimes.reduce((acc, curr) => {
        acc[curr.track] = (acc[curr.track] || 0) + 1;
        return acc;
      }, {})).sort((a,b) => b[1] - a[1])[0][0]
    : 'Nenhuma registrada';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification('');
    
    try {
      await updateProfile({
        name,
        cnhStatus,
        avatarUrl: avatarPreview
      });
      setNotification('Perfil atualizado com sucesso!');
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      setNotification('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'PI';
  };

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'profile' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: '0.2s',
              marginBottom: '-1.1rem'
            }}
          >
            <UserIcon size={18} /> MEU PERFIL
          </button>
          <button 
            onClick={() => setActiveTab('garage')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'garage' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'garage' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: '0.2s',
              marginBottom: '-1.1rem'
            }}
          >
            <LayoutGrid size={18} /> MINHA GARAGEM
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="animate-in">
            <h1 className="hero-title">PILOT <span>PROFILE</span></h1>
            
            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
              
              {/* Driver License Card Style */}
              <div className="card animate-in" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(243, 18, 96, 0.1)' }}>
                <div style={{ background: 'var(--accent-primary)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '900', fontSize: '0.8rem', letterSpacing: '0.1em' }}>FEDERAÇÃO GLOBAL DE PILOTOS</span>
                  <ShieldCheck size={18} />
                </div>
                
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div 
                    className="avatar" 
                    onClick={() => fileInputRef.current?.click()} 
                    style={{ 
                      width: '140px', 
                      height: '140px', 
                      margin: '0 auto 1.5rem', 
                      border: '4px solid var(--accent-primary)',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      background: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-primary)', fontFamily: 'var(--font-tech)' }}>{getInitials(user.name)}</span>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.3rem', display: 'flex', justifyContent: 'center' }}>
                      <Camera size={14} color="#fff" />
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{user.name}</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.65rem', background: cnhStatus === 'Definitiva' ? 'var(--success)' : 'var(--warning)', color: '#000', fontWeight: '900', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>
                      CNH {cnhStatus.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>MEMBRO DESDE:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>GARAGEM:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{cars.length} VEÍCULOS</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>PISTA FAVORITA:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{favoriteTrack.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: '700' }}>
                  LICENÇA DE PILOTO RANK: CLASSE S
                </div>
              </div>

              {/* Edit Profile & Main Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Quick Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #1a1c22 100%)' }}>
                    <Trophy size={24} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <div className="label">Melhor Tempo Geral</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-tech)' }}>
                      {bestLap ? `${bestLap.timeMinutes}:${bestLap.timeSeconds}.${bestLap.timeMillis}` : '--:--.---'}
                    </div>
                    {bestLap && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.25rem' }}>{bestLap.carName} @ {bestLap.track}</div>}
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <Car size={24} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <div className="label">Carro Mais Utilizado</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', marginTop: '0.5rem' }}>
                      {bestLap ? bestLap.carName.toUpperCase() : '---'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>BASEADO NO HISTÓRICO DE VOLTAS</div>
                  </div>
                </div>

                <div className="card">
                  <div className="title" style={{ fontSize: '1.1rem' }}>Configurações da Conta</div>
                  <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label className="label">NOME PARA EXIBIÇÃO</label>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">DOC / CNH STATUS</label>
                        <select className="input" value={cnhStatus} onChange={e => setCnhStatus(e.target.value)}>
                          <option value="Provisória">Provisória (PPD)</option>
                          <option value="Definitiva">Definitiva</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                        {saving ? 'PROCESSANDO...' : 'ATUALIZAR DADOS'}
                      </button>
                    </div>
                    {notification && <div className="animate-in" style={{ color: 'var(--success)', marginTop: '1rem', fontWeight: '800', fontSize: '0.8rem' }}>✓ {notification}</div>}
                  </form>
                </div>
                
                <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <ShieldCheck size={24} color="var(--danger)" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <strong style={{ color: 'var(--danger)' }}>AVISO LEGAL:</strong> A maioria dos autódromos nacionais exige CNH Definitiva para liberação de acesso à pista (Track Day). Mantenha seu status atualizado.
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="animate-in">
            <Garage />
          </div>
        )}
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
    </>
  );
}
