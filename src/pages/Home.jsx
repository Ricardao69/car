import React, { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useLapTimes } from '../hooks/useLapTimes';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, Car, Timer, Zap, MapPin, ArrowRight, Instagram, Heart } from 'lucide-react';

export default function Home() {
  const { events } = useEvents();
  const { lapTimes } = useLapTimes();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pilotos: 0, maquinas: 0, recordesSemana: 0 });
  const [feedPosts, setFeedPosts] = useState([]);

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch real feed posts
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFeedPosts(data.filter(p => p.imageUrl).slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching feed:', err);
      }
    };
    fetchFeed();
  }, []);

  // Sort lap times for ranking
  const topRankings = [...lapTimes]
    .sort((a, b) => a.totalMillis - b.totalMillis)
    .slice(0, 5);

  // Filter events (live and upcoming)
  const now = new Date();
  const liveEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.toDateString() === now.toDateString();
  });

  const upcomingEvents = events
    .filter(e => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const pastEvents = events
    .filter(e => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className="home-container animate-in">
      <div style={{ marginBottom: '4rem' }}>
        <h1 className="hero-title" style={{ fontSize: '3.5rem' }}>BEM-VINDO À <span style={{ color: 'var(--accent-primary)' }}>COMUNIDADE</span></h1>
        <p className="subtitle">Sua central de controle para performance, eventos e comunidade car culture.</p>
      </div>

      {/* Grid de Estatísticas Reais */}
      <div className="section-grid" style={{ marginBottom: '4rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card stats-card">
          <div className="icon-wrapper"><Users size={24} /></div>
          <div className="stats-info">
            <span className="label">PILOTOS</span>
            <span className="value">{stats.pilotos.toLocaleString()}</span>
          </div>
        </div>
        <div className="card stats-card">
          <div className="icon-wrapper"><Car size={24} /></div>
          <div className="stats-info">
            <span className="label">MÁQUINAS</span>
            <span className="value">{stats.maquinas.toLocaleString()}</span>
          </div>
        </div>
        <div className="card stats-card highlight">
          <div className="icon-wrapper"><Trophy size={24} /></div>
          <div className="stats-info">
            <span className="label">RECORDES SEMANA</span>
            <span className="value">{stats.recordesSemana}</span>
          </div>
        </div>
      </div>

      <div className="main-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '4rem' }}>
        
        <div className="left-column">
          {/* Sessão de Ranking Compacto */}
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy color="var(--accent-primary)" size={24} /> TOP RANKING GLOBAL
              </h2>
              <button className="link-btn" onClick={() => navigate('/ranking')}>VER TUDO <ArrowRight size={16} /></button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '2rem' }}>POS</th>
                    <th>PILOTO</th>
                    <th>CARRO</th>
                    <th style={{ textAlign: 'right', paddingRight: '2rem' }}>MELHOR VOLTA</th>
                  </tr>
                </thead>
                <tbody>
                  {topRankings.map((lap, index) => (
                    <tr key={lap.id} className="ranking-row">
                      <td style={{ paddingLeft: '2rem', fontWeight: '900' }}>#{index + 1}</td>
                      <td style={{ fontWeight: '800' }}>{lap.userName}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lap.carName}</td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem', fontFamily: 'var(--font-tech)', color: 'var(--accent-primary)', fontWeight: '900' }}>
                        {lap.timeMinutes}:{lap.timeSeconds}.{lap.timeMillis}
                      </td>
                    </tr>
                  ))}
                  {topRankings.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Sem registros no momento</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Social Feed - Real Posts with Images */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Instagram color="var(--accent-primary)" size={24} /> FEED DA COMUNIDADE
              </h2>
              <button className="link-btn" onClick={() => navigate('/feed')}>VER TUDO <ArrowRight size={16} /></button>
            </div>
            <div className="photo-grid">
              {feedPosts.length > 0 ? (
                feedPosts.map(post => (
                  <div key={post.id} className="photo-item" onClick={() => navigate('/feed')}>
                    <img src={post.imageUrl} alt={`Post de ${post.userName}`} />
                    <div className="photo-info">
                      <span className="user-tag">@{post.userName?.toLowerCase()}</span>
                      <span className="likes"><Heart size={12} fill="var(--accent-primary)" /> {post.likeCount || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback if no posts with images
                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Nenhuma foto na comunidade ainda. <span style={{ cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => navigate('/feed')}>Poste a primeira!</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="right-column">
          {/* Eventos Ao Vivo */}
          <section style={{ marginBottom: '4rem' }}>
            <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="status-dot live"></div> ACONTECENDO AGORA
            </h3>
            {liveEvents.length > 0 ? (
              liveEvents.map(event => (
                <div key={event.id} className="card event-status-card live">
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className="event-loc"><MapPin size={12} /> {event.location}</span>
                  </div>
                  <Zap size={20} color="var(--accent-primary)" className="pulse" />
                </div>
              ))
            ) : (
              <div className="card empty-status">Nenhum evento ao vivo no momento</div>
            )}
          </section>

          {/* Próximos Eventos */}
          <section style={{ marginBottom: '4rem' }}>
            <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>PRÓXIMOS ENCONTROS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingEvents.map(event => (
                <div key={event.id} className="card event-status-card" onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}>
                  <div className="event-date">
                    <span className="day">{new Date(event.date).getDate()}</span>
                    <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                  </div>
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className="event-loc">{event.location}</span>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <div className="card empty-status">Agenda livre por enquanto</div>}
            </div>
          </section>

          {/* Eventos Recentes */}
          <section>
            <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>EVENTOS RECENTES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pastEvents.map(event => (
                <div key={event.id} className="card event-status-card past">
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className="event-loc">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {pastEvents.length === 0 && <div className="card empty-status">Nenhum histórico recente</div>}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
