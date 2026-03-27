import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Calendar, MapPin, ShieldAlert, Trash2, Clock, Users, Plus, CheckCircle, Edit3, X } from 'lucide-react';

export default function Events() {
  const { user } = useAuth();
  const { events, addEvent, removeEvent, toggleRsvp, updateEvent } = useEvents();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    rules: 'Respeito absoluto às leis de trânsito locais. Proibido manobras perigosas, borrachão ou excesso de ruído no local.'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      rules: 'Respeito absoluto às leis de trânsito locais. Proibido manobras perigosas, borrachão ou excesso de ruído no local.'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) return;

    if (editingEventId) {
      await updateEvent(editingEventId, formData);
      setEditingEventId(null);
      toast.success('Evento atualizado!');
    } else {
      await addEvent({
        ...formData,
        organizerName: user.name,
        organizerId: user.id
      });
      toast.success('Evento criado com sucesso!');
    }

    resetForm();
    setShowAdd(false);
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      rules: event.rules
    });
    setEditingEventId(event.id);
    setShowAdd(true);
  };

  const handleRsvp = async (eventId) => {
    const result = await toggleRsvp(eventId);
    if (result) {
      toast.success(result.confirmed ? 'Presença confirmada! 🏁' : 'Presença cancelada.');
    }
  };

  const handleDelete = async (eventId) => {
    await removeEvent(eventId);
    toast.success('Evento removido.');
  };

  const isUserConfirmed = (event) => {
    const rsvps = Array.isArray(event.rsvps) ? event.rsvps : [];
    return rsvps.some(r => (typeof r === 'string' ? r : r.userId) === user?.id);
  };

  const getRsvpCount = (event) => {
    const rsvps = Array.isArray(event.rsvps) ? event.rsvps : [];
    return rsvps.length;
  };

  const getRsvpNames = (event) => {
    const rsvps = Array.isArray(event.rsvps) ? event.rsvps : [];
    return rsvps.map(r => typeof r === 'string' ? r : (r.userName || r.userId));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div>
          <h1 className="hero-title">CENTRAL DE <span>EVENTOS</span></h1>
          <p className="subtitle">Encontros automotivos, Track Days e conexões da comunidade.</p>
        </div>
        {!showAdd && (
          <button className="btn-primary" onClick={() => { resetForm(); setEditingEventId(null); setShowAdd(true); }}>
            <Plus size={20} /> ORGANIZAR ENCONTRO
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card animate-in" style={{ marginBottom: '4rem', padding: '3rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="title" style={{ marginBottom: '2rem' }}>
            {editingEventId ? 'EDITAR EVENTO' : 'NOVO EVENTO'}
          </div>
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
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {editingEventId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NO MURAL'}
              </button>
              <button type="button" className="btn-primary" style={{ background: 'var(--bg-tertiary)', color: '#fff' }} onClick={() => { setShowAdd(false); setEditingEventId(null); resetForm(); }}>CANCELAR</button>
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
          {events.map(event => {
            const confirmed = isUserConfirmed(event);
            const rsvpCount = getRsvpCount(event);
            const rsvpNames = getRsvpNames(event);

            return (
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
                  
                  {/* RSVP Count Badge */}
                  {rsvpCount > 0 && (
                    <div style={{
                      position: 'absolute', top: '1.5rem', left: '1.5rem',
                      background: 'var(--accent-primary)',
                      padding: '0.4rem 0.8rem', borderRadius: '20px',
                      fontSize: '0.7rem', fontWeight: 900,
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      <Users size={14} /> {rsvpCount} CONFIRMADO{rsvpCount > 1 ? 'S' : ''}
                    </div>
                  )}

                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    {user.id === event.organizerId && (
                      <>
                        <button onClick={() => handleEdit(event)} style={{ background: 'rgba(59, 130, 246, 0.15)', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(event.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <Trash2 size={18} />
                        </button>
                      </>
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

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldAlert size={14} color="var(--accent-primary)" /> Regras
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>
                      {event.rules.length > 100 ? event.rules.substring(0, 100) + '...' : event.rules}
                    </p>
                  </div>

                  {/* Confirmed users list */}
                  {rsvpCount > 0 && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                        CONFIRMADOS
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {rsvpNames.map((name, i) => (
                          <span key={i} style={{
                            fontSize: '0.7rem', fontWeight: 800,
                            background: 'var(--accent-soft)',
                            color: 'var(--accent-primary)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '20px'
                          }}>
                            @{name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' }}>
                        {event.organizerName.substring(0,1).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Organizado por<br/><strong style={{ color: '#fff' }}>{event.organizerName}</strong>
                      </div>
                    </div>
                    <button 
                      className="btn-primary" 
                      style={{ 
                        padding: '0.6rem 1.2rem', 
                        fontSize: '0.75rem',
                        background: confirmed ? 'var(--success)' : 'var(--accent-primary)',
                        transition: '0.3s'
                      }}
                      onClick={() => handleRsvp(event.id)}
                    >
                      <CheckCircle size={14} /> {confirmed ? 'CONFIRMADO ✓' : 'EU VOU'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
