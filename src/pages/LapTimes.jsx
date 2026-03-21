import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useGarage } from '../hooks/useGarage';
import { useLapTimes } from '../hooks/useLapTimes';
import { Timer, MapPin, Plus, History, Trash2, CloudRain, Sun, Cloud, Calendar, Info } from 'lucide-react';

export default function LapTimes() {
  const { cars } = useGarage();
  const { lapTimes, addLapTime, removeLapTime } = useLapTimes();
  
  const [formData, setFormData] = useState({
    carId: '',
    track: '',
    minutes: '01',
    seconds: '20',
    millis: '000',
    trackCondition: 'Seca',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedCar = cars.find(c => c.id === formData.carId);
    if (!selectedCar || !formData.track) return;

    await addLapTime({
      carId: selectedCar.id,
      carName: `${selectedCar.marca} ${selectedCar.modelo}`,
      carTracao: selectedCar.tracao,
      carCavalaria: selectedCar.cavalaria,
      track: formData.track,
      timeMinutes: formData.minutes.padStart(2, '0'),
      timeSeconds: formData.seconds.padStart(2, '0'),
      timeMillis: formData.millis.padStart(3, '0'),
      trackCondition: formData.trackCondition,
      notes: formData.notes,
      date: new Date(formData.date).toISOString()
    });

    setFormData({ ...formData, minutes: '01', seconds: '20', millis: '000', notes: '' });
  };

  const getConditionIcon = (cond) => {
    switch(cond) {
      case 'Seca': return <Sun size={14} />;
      case 'Molhada': return <CloudRain size={14} />;
      default: return <Cloud size={14} />;
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="hero-title">REGISTRAR <span>TEMPO</span></h1>
        <p className="subtitle">Documente sua performance com precisão técnica.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: lapTimes.length > 0 ? '450px 1fr' : '1fr', gap: '3rem', alignItems: 'start' }}>
        <div className="card animate-in" style={{ padding: '2.5rem', borderTop: '4px solid var(--accent-primary)', position: 'sticky', top: '100px' }}>
          <div className="title" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}><Timer size={18} color="var(--accent-primary)" /> NOVA ENTRADA</div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">VEÍCULO</label>
              <select 
                className="input" 
                value={formData.carId} 
                onChange={e => setFormData({...formData, carId: e.target.value})}
                required
              >
                <option value="">Selecione o carro...</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>{c.marca} {c.modelo} ({c.tracao})</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">AUTÓDROMO / PISTA</label>
              <input 
                className="input" 
                placeholder="Ex: Interlagos" 
                value={formData.track}
                onChange={e => setFormData({...formData, track: e.target.value})}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label">TEMPO (MM:SS.ms)</label>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input type="number" className="input" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }} placeholder="00" value={formData.minutes} onChange={e => setFormData({...formData, minutes: e.target.value})} />
                <span style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>:</span>
                <input type="number" className="input" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }} placeholder="00" value={formData.seconds} onChange={e => setFormData({...formData, seconds: e.target.value})} />
                <span style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>.</span>
                <input type="number" className="input" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }} placeholder="000" value={formData.millis} onChange={e => setFormData({...formData, millis: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="label">CONDIÇÃO</label>
                <select className="input" style={{ fontSize: '0.8rem' }} value={formData.trackCondition} onChange={e => setFormData({...formData, trackCondition: e.target.value})}>
                  <option value="Seca">Seca</option>
                  <option value="Molhada">Molhada</option>
                  <option value="Mista">Mista</option>
                </select>
              </div>
              <div>
                <label className="label">DATA</label>
                <input type="date" className="input" style={{ fontSize: '0.8rem' }} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label className="label">OBSERVAÇÕES</label>
              <input className="input" placeholder="Ajustes, pneus..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              SALVAR REGISTRO
            </button>
          </form>
        </div>

        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="title" style={{ marginBottom: 0 }}><History size={20} color="var(--accent-primary)" /> LOG DE SESSÕES</h2>
            <div className="card" style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontWeight: '800' }}>
              <span style={{ color: 'var(--text-muted)' }}>TOTAL:</span> {lapTimes.length}
            </div>
          </div>
          
          {lapTimes.length === 0 ? (
            <div className="empty-state" style={{ padding: '5rem' }}>
              <p className="subtitle">Nenhum tempo registrado para os seus veículos.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lapTimes.sort((a,b) => new Date(b.date) - new Date(a.date)).map(lap => (
                <div key={lap.id} className="card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)', minWidth: '140px' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '900', marginBottom: '0.2rem' }}>TIME</div>
                      <div style={{ fontFamily: 'var(--font-tech)', fontWeight: '900', color: 'var(--accent-primary)', fontSize: '1.5rem' }}>
                        {lap.timeMinutes}:{lap.timeSeconds}<span style={{ fontSize: '0.7em', opacity: 0.6 }}>.{lap.timeMillis}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{lap.carName.toUpperCase()}</div>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={12} color="var(--accent-primary)"/> {lap.track}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{getConditionIcon(lap.trackCondition)} {lap.trackCondition}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={12}/> {new Date(lap.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {lap.notes && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Info size={12} /> {lap.notes}
                      </div>
                    )}
                    <button 
                      onClick={() => removeLapTime(lap.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
