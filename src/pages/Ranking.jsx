import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useLapTimes } from '../hooks/useLapTimes';
import { Trophy, Zap, Filter, MapPin, Search } from 'lucide-react';

const POWER_BRACKETS = [
  { name: 'Pocket Rocket', max: 120, color: '#94a3b8' },
  { name: 'Street', min: 121, max: 180, color: '#10b981' },
  { name: 'Sport', min: 181, max: 250, color: '#3b82f6' },
  { name: 'Clubsport', min: 251, max: 350, color: '#8b5cf6' },
  { name: 'Super', min: 351, max: 500, color: '#f59e0b' },
  { name: 'Exotic', min: 501, max: 750, color: '#ef4444' },
  { name: 'Hyper', min: 751, max: Infinity, color: '#ec4899' },
];

const TRACTIONS = ['FWD', 'RWD', 'AWD'];

export default function Ranking() {
  const { lapTimes } = useLapTimes();
  const [filterTrack, setFilterTrack] = useState('Todos');

  // Dynamic list of tracks for filtering
  const tracks = ['Todos', ...new Set(lapTimes.map(l => l.track))];

  const getPowerBracket = (cv) => {
    return POWER_BRACKETS.find(b => {
      const min = b.min || 0;
      const max = b.max || Infinity;
      return cv >= min && cv <= max;
    });
  };

  const filteredData = filterTrack === 'Todos' 
    ? lapTimes 
    : lapTimes.filter(l => l.track === filterTrack);

  return (
    <div className="page-container">
      <Navbar />

      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="hero-title">RANKING <span>MUNDIAL</span></h1>
        <p className="subtitle">Status de elite: Os tempos mais baixos por categoria técnica.</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '3rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--bg-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="var(--accent-primary)" />
          <span className="label" style={{ marginBottom: 0 }}>Filtrar Pista</span>
        </div>
        <select 
          className="input" 
          style={{ maxWidth: '300px', padding: '0.5rem 1rem' }}
          value={filterTrack}
          onChange={e => setFilterTrack(e.target.value)}
        >
          {tracks.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800' }}>
          <Search size={16} /> DATA SYNCED REAL-TIME
        </div>
      </div>

      {TRACTIONS.map(tracao => {
        const hasTractionData = filteredData.some(l => l.carTracao === tracao);
        if (!hasTractionData) return null;

        return (
          <div key={tracao} className="animate-in" style={{ marginBottom: '5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <h2 className="title" style={{ marginBottom: 0, fontSize: '2rem' }}>TRAÇÃO {tracao}</h2>
              <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, var(--accent-primary) 0%, transparent 100%)' }}></div>
            </div>
            
            <div className="section-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))' }}>
              {POWER_BRACKETS.map(bracket => {
                const results = filteredData
                  .filter(l => l.carTracao === tracao && getPowerBracket(l.carCavalaria)?.name === bracket.name)
                  .sort((a, b) => a.totalMillis - b.totalMillis);

                if (results.length === 0) return null;

                return (
                  <div key={bracket.name} className="card" style={{ padding: '0', borderTop: `4px solid ${bracket.color}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      <span style={{ fontWeight: '900', color: bracket.color, letterSpacing: '0.1em', fontSize: '0.8rem' }}>{bracket.name.toUpperCase()}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>{bracket.max === Infinity ? `${bracket.min}+` : `${bracket.min || 0}-${bracket.max}`} CV</span>
                    </div>

                    <table className="ranking-table" style={{ margin: '0.5rem 0' }}>
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: '1.5rem', width: '60px' }}>POS</th>
                          <th>PILOTO / MÁQUINA</th>
                          <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>MELHOR VOLTA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((lap, index) => (
                          <tr key={lap.id} className="ranking-row">
                            <td style={{ paddingLeft: '1.5rem', fontWeight: '900', color: index === 0 ? 'var(--accent-primary)' : 'inherit' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {index === 0 && <Trophy size={14} color="var(--accent-primary)"/>}
                                {String(index + 1).padStart(2, '0')}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff' }}>{lap.userName.toUpperCase()}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>{lap.carName} • {lap.track}</div>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '1.5rem', fontFamily: 'var(--font-tech)', color: 'var(--accent-primary)', fontWeight: '900', fontSize: '1.2rem' }}>
                              {lap.timeMinutes}:{lap.timeSeconds}.{lap.timeMillis}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {lapTimes.length === 0 && (
        <div className="empty-state">
          <Trophy size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
          <h2 className="title">Sem competidores ainda</h2>
          <p className="subtitle">Seja o primeiro a registrar um tempo para inaugurar o ranking mundial.</p>
        </div>
      )}
    </div>
  );
}
