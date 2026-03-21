import React from 'react';
import { useEvents } from '../hooks/useEvents';
import { useLapTimes } from '../hooks/useLapTimes';
import { Trophy, Calendar, Users, Car, Timer, Zap, MapPin, ArrowRight, Instagram } from 'lucide-react';

export default function Home() {
  const { events } = useEvents();
  const { lapTimes } = useLapTimes();

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

  // Dummy data for Instagram-style feed
  const feedPhotos = [
    { id: 1, user: 'Ricardo', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', likes: 124 },
    { id: 2, user: 'Gabriel', url: 'https://images.unsplash.com/photo-1542362567-b055002b91f4', likes: 89 },
    { id: 3, user: 'Ana', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7', likes: 210 },
    { id: 4, user: 'Lucas', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e', likes: 56 },
    { id: 5, user: 'Carlos', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8', likes: 302 },
    { id: 6, user: 'Maria', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d', likes: 145 },
  ];

  return (
    <div className="home-container animate-in">
      <div style={{ marginBottom: '4rem' }}>
        <h1 className="hero-title" style={{ fontSize: '3.5rem' }}>BEM-VINDO À <span style={{ color: 'var(--accent-primary)' }}>COMUNIDADE</span></h1>
        <p className="subtitle">Sua central de controle para performance, eventos e comunidade car culture.</p>
      </div>

      {/* Grid de Estatísticas Rápidas */}
      <div className="section-grid" style={{ marginBottom: '4rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card stats-card">
          <div className="icon-wrapper"><Users size={24} /></div>
          <div className="stats-info">
            <span className="label">PILOTOS</span>
            <span className="value">1.258</span>
          </div>
        </div>
        <div className="card stats-card">
          <div className="icon-wrapper"><Car size={24} /></div>
          <div className="stats-info">
            <span className="label">MÁQUINAS</span>
            <span className="value">3.402</span>
          </div>
        </div>
        <div className="card stats-card highlight">
          <div className="icon-wrapper"><Trophy size={24} /></div>
          <div className="stats-info">
            <span className="label">RECORDES SEMANA</span>
            <span className="value">42</span>
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
              <button className="link-btn">VER TUDO <ArrowRight size={16} /></button>
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

          {/* Social Feed - Instagram Style */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Instagram color="var(--accent-primary)" size={24} /> FEED DA COMUNIDADE
              </h2>
            </div>
            <div className="photo-grid">
              {feedPhotos.map(photo => (
                <div key={photo.id} className="photo-item">
                  <img src={photo.url} alt={`Post de ${photo.user}`} />
                  <div className="photo-info">
                    <span className="user-tag">@{photo.user.toLowerCase()}</span>
                    <span className="likes"><Zap size={12} fill="var(--accent-primary)" /> {photo.likes}</span>
                  </div>
                </div>
              ))}
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
                <div key={event.id} className="card event-status-card">
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
