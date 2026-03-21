import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, ShieldAlert, Trash2, Clock, Users, Plus, CheckCircle } from 'lucide-react';

export default function Events() {
  const { user } = useAuth();
  const { events, addEvent, removeEvent } = useEvents();
  const [showAdd, setShowAdd] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    rules: 'Respeito absoluto às leis de trânsito locais. Proibido manobras perigosas, borrachão ou excesso de ruído no local.'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) return;

    await addEvent({
      ...formData,
      organizerName: user.name,
      organizerId: user.id
    });

    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      rules: 'Respeito absoluto às leis de trânsito locais. Proibido manobras perigosas, borrachão ou excesso de ruído no local.'
    });
    setShowAdd(false);
  };

  return (
    <div className="page-container">
      <Navbar />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div>
          <h1 className="hero-title">CENTRAL DE <span>EVENTOS</span></h1>
          <p className="subtitle">Encontros automotivos, Track Days e conexões da comunidade.</p>
        </div>
        {!showAdd && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={20} /> ORGANIZAR ENCONTRO
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card animate-in" style={{ marginBottom: '4rem', padding: '3rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="title" style={{ marginBottom: '2rem' }}>NOVO EVENTO</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="label">TÍTULO DO EVENTO</label>
                <input required className="input" placeholder="Ex: Night Run Interlagos" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="label">DATA</label>
                <input required type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="label">HORÁRIO</label>
                <input required type="time" className="input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">LOCAL DE ENCONTRO</label>
              <input required className="input" placeholder="Endereço, Cidade/Estado ou Ponto de Referência" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={16} color="var(--accent-primary)" /> REGRAS DE CONDUTA E SEGURANÇA
              </label>
              <textarea 
                className="input" 
                style={{ height: '100px', resize: 'none' }} 
                value={formData.rules} 
                onChange={e => setFormData({...formData, rules: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>PUBLICAR NO MURAL</button>
              <button type="button" className="btn-primary" style={{ background: 'var(--bg-tertiary)', color: '#fff' }} onClick={() => setShowAdd(false)}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 && !showAdd ? (
        <div className="empty-state animate-in">
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '3rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <Calendar size={80} color="var(--text-muted)" />
          </div>
          <h2 className="hero-title" style={{ fontSize: '2rem' }}>CRIE SEU PRÓPRIO <span>ENCONTRO!</span></h2>
          <p className="subtitle" style={{ marginBottom: '2.5rem', maxWidth: '500px' }}>Nenhum evento agendado. Que tal organizar o primeiro e reunir a galera do asfalto?</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>COMEÇAR AGORA</button>
        </div>
      ) : (
        <div className="section-grid">
          {events.map(event => (
            <div key={event.id} className="card animate-in" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
              <div style={{ 
                height: '160px', 
                background: 'linear-gradient(45deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <MapPin size={40} color="var(--accent-primary)" style={{ opacity: 0.3 }} />
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                   {user.id === event.organizerId && (
                    <button onClick={() => removeEvent(event.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', fontSize: '0.65rem', fontWeight: '900', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>EVENTO OFICIAL</span>
                  <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '900', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>{event.time}</span>
                </div>

                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1rem', fontFamily: 'var(--font-tech)' }}>{event.title.toUpperCase()}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Calendar size={16} color="var(--accent-primary)" /> {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={16} color="var(--accent-primary)" /> {event.location}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={14} color="var(--accent-primary)" /> Regras
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>
                    {event.rules.length > 100 ? event.rules.substring(0, 100) + '...' : event.rules}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' }}>
                      {event.organizerName.substring(0,1).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Organizado por<br/><strong style={{ color: '#fff' }}>{event.organizerName}</strong>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>
                    <CheckCircle size={14} /> EU VOU
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
