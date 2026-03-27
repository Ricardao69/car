import React, { useState, useEffect } from 'react';
import { X, Car, Trophy, Calendar, MapPin, Heart, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import ImageModal from './ImageModal';

export default function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (!userId) return null;

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

  const userPhotos = profile?.posts?.filter(p => p.imageUrl) || [];
  
  // Derived stats
  const bestLap = profile?.bestLaps?.length > 0 ? profile.bestLaps[0] : null;
  
  let favoriteTrack = 'Nenhuma registrada';
  if (profile?.bestLaps && profile.bestLaps.length > 0) {
    const trackCounts = profile.bestLaps.reduce((acc, curr) => {
      acc[curr.track] = (acc[curr.track] || 0) + 1;
      return acc;
    }, {});
    favoriteTrack = Object.entries(trackCounts).sort((a,b) => b[1] - a[1])[0][0];
  }

  let mostUsedCar = '---';
  if (profile?.bestLaps && profile.bestLaps.length > 0) {
     const carCounts = profile.bestLaps.reduce((acc, curr) => {
      acc[curr.carName] = (acc[curr.carName] || 0) + 1;
      return acc;
    }, {});
    mostUsedCar = Object.entries(carCounts).sort((a,b) => b[1] - a[1])[0][0].toUpperCase();
  } else if (profile?.cars && profile.cars.length > 0) {
    mostUsedCar = `${profile.cars[0].marca} ${profile.cars[0].modelo}`.toUpperCase();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'toastIn 0.3s ease forwards'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
           <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando perfil...</div>
        ) : profile ? (
          <div style={{ padding: '2rem', overflowY: 'auto' }}>
            <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>PILOT <span>PROFILE</span></h1>

            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
              
              {/* Left Column: Driver License Card */}
              <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(243, 18, 96, 0.1)', height: 'fit-content' }}>
                <div style={{ background: 'var(--accent-primary)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '900', fontSize: '0.8rem', letterSpacing: '0.1em' }}>FEDERAÇÃO GLOBAL DE PILOTOS</span>
                  <ShieldCheck size={18} color="#fff" />
                </div>
                
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ 
                      width: '140px', height: '140px', margin: '0 auto 1.5rem', 
                      border: '4px solid var(--accent-primary)', borderRadius: '50%',
                      overflow: 'hidden', background: '#1a1a1a', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                  }}>
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-primary)', fontFamily: 'var(--font-tech)' }}>{getInitials(profile.name)}</span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{profile.name}</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {profile.cnhStatus && (
                      <span style={{ fontSize: '0.65rem', background: profile.cnhStatus === 'Definitiva' ? 'var(--success)' : 'var(--warning)', color: '#000', fontWeight: '900', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>
                        CNH {profile.cnhStatus.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>MEMBRO DESDE:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{new Date(profile.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>GARAGEM:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{profile.cars?.length || 0} VEÍCULOS</span>
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

              {/* Right Column: Stats & Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Quick Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                  <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #1a1c22 100%)' }}>
                    <Trophy size={24} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <div className="label">Melhor Tempo Geral</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-tech)' }}>
                      {bestLap ? `${bestLap.timeMinutes}:${bestLap.timeSeconds}.${bestLap.timeMillis}` : '--:--.---'}
                    </div>
                    {bestLap && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bestLap.carName} @ {bestLap.track}</div>}
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <Car size={24} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <div className="label">Carro Mais Utilizado</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mostUsedCar}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>BASEADO NO HISTÓRICO</div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {['posts', 'garage', 'events'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s'
                      }}
                    >
                      {tab === 'posts' && 'Atividade'}
                      {tab === 'garage' && 'Garagem'}
                      {tab === 'events' && 'Eventos Organizados'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div>
                  {/* TAB: POSTS */}
                  {activeTab === 'posts' && (
                    <div className="animate-in">
                      {userPhotos.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ImageIcon size={12} /> FOTOS
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {userPhotos.map(p => (
                              <img 
                                key={`img-${p.id}`} 
                                src={p.imageUrl} 
                                alt="Foto" 
                                onClick={() => setSelectedImage(p.imageUrl)}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, cursor: 'pointer' }} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {profile.posts && profile.posts.length > 0 ? profile.posts.map(post => (
                          <div key={post.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{post.content}</p>
                            {post.imageUrl && (
                              <img 
                                src={post.imageUrl} 
                                alt="Post" 
                                onClick={() => setSelectedImage(post.imageUrl)}
                                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem', cursor: 'pointer' }} 
                              />
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: post.likeCount > 0 ? 'var(--accent-primary)' : 'inherit' }}>
                                <Heart size={12} fill={post.likeCount > 0 ? 'var(--accent-primary)' : 'none'} /> {post.likeCount}
                              </span>
                            </div>
                          </div>
                        )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma atividade registrada na comunidade.</div>}
                      </div>
                    </div>
                  )}

                  {/* TAB: GARAGE */}
                  {activeTab === 'garage' && (
                    <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {profile.cars && profile.cars.length > 0 ? profile.cars.map((car, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderTop: '3px solid var(--accent-primary)', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px', color: '#fff' }}>
                            {car.marca} {car.modelo}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span><strong>Ano:</strong> {car.ano}</span>
                            <span><strong>Motor:</strong> {car.cavalaria} CV</span>
                            <span><strong>Tração:</strong> {car.tracao}</span>
                          </div>
                        </div>
                      )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>Garagem vazia.</div>}
                    </div>
                  )}

                  {/* TAB: EVENTS */}
                  {activeTab === 'events' && (
                    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.organizedEvents && profile.organizedEvents.length > 0 ? profile.organizedEvents.map(event => (
                        <div key={event.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', padding: '1.25rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem', color: '#fff' }}>{event.title.toUpperCase()}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="var(--accent-primary)" /> {new Date(event.date).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--accent-primary)" /> {event.location}</span>
                          </div>
                        </div>
                      )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum evento organizado.</div>}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Perfil não encontrado
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}
