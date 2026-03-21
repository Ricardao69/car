import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useGarage } from '../hooks/useGarage';
import { Plus, Trash2, CarFront, Zap, Gauge, Weight, Calendar as CalendarIcon, Disc } from 'lucide-react';

export default function Garage() {
  const { cars, addCar, removeCar, addMaintenance, removeMaintenance } = useGarage();
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({ 
    marca: '', modelo: '', tracao: 'FWD', cavalaria: '', 
    peso: '', ano: new Date().getFullYear(), pneu: 'Rua' 
  });
  
  const [activeMaintenanceCar, setActiveMaintenanceCar] = useState(null);
  const [newMaintenance, setNewMaintenance] = useState({ type: 'Mecânica', description: '' });

  const handleAddCar = async (e) => {
    e.preventDefault();
    if (!newCar.marca || !newCar.modelo || !newCar.cavalaria) return;
    await addCar({
      ...newCar,
      cavalaria: parseInt(newCar.cavalaria),
      peso: parseInt(newCar.peso) || null,
      ano: parseInt(newCar.ano)
    });
    setNewCar({ marca: '', modelo: '', tracao: 'FWD', cavalaria: '', peso: '', ano: new Date().getFullYear(), pneu: 'Rua' });
    setShowAddCar(false);
  };

  const handleAddMaintenance = async (e, carId) => {
    e.preventDefault();
    if (!newMaintenance.description) return;
    await addMaintenance(carId, newMaintenance);
    setNewMaintenance({ type: 'Mecânica', description: '' });
    setActiveMaintenanceCar(null);
  };

  return (
    <div className="page-container">
      <Navbar />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 className="hero-title">MINHA <span>GARAGEM</span></h1>
          <p className="subtitle">Gerencie seus projetos e mantenha a performance em dia.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <span className="car-stat-label">Frota Total</span>
            <span className="car-stat-value" style={{ color: 'var(--accent-primary)' }}>{cars.length}</span>
          </div>
          <div className="card" style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <span className="car-stat-label">Potência Acumulada</span>
            <span className="car-stat-value">{cars.reduce((acc, c) => acc + (c.cavalaria || 0), 0)} CV</span>
          </div>
          <button className="btn-primary" onClick={() => setShowAddCar(!showAddCar)}>
            <Plus size={20} /> ADICIONAR VEÍCULO
          </button>
        </div>
      </div>

      {showAddCar && (
        <div className="card animate-in" style={{ marginBottom: '3rem' }}>
          <div className="title"><Plus size={20} color="var(--accent-primary)" /> CONFIGURAR NOVO PROJETO</div>
          <form onSubmit={handleAddCar} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div>
              <label className="label">Marca</label>
              <input required className="input" placeholder="Ex: Honda" value={newCar.marca} onChange={e => setNewCar({...newCar, marca: e.target.value})} />
            </div>
            <div>
              <label className="label">Modelo</label>
              <input required className="input" placeholder="Ex: Civic Si" value={newCar.modelo} onChange={e => setNewCar({...newCar, modelo: e.target.value})} />
            </div>
            <div>
              <label className="label">Ano</label>
              <select className="input" value={newCar.ano} onChange={e => setNewCar({...newCar, ano: e.target.value})}>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tração</label>
              <select className="input" value={newCar.tracao} onChange={e => setNewCar({...newCar, tracao: e.target.value})}>
                <option value="FWD">FWD (Dianteira)</option>
                <option value="RWD">RWD (Traseira)</option>
                <option value="AWD">AWD (Integral)</option>
              </select>
            </div>
            <div>
              <label className="label">Potência (CV)</label>
              <input required type="number" className="input" placeholder="Ex: 192" value={newCar.cavalaria} onChange={e => setNewCar({...newCar, cavalaria: e.target.value})} />
            </div>
            <div>
              <label className="label">Peso (KG)</label>
              <input type="number" className="input" placeholder="Ex: 1250" value={newCar.peso} onChange={e => setNewCar({...newCar, peso: e.target.value})} />
            </div>
            <div>
              <label className="label">Tipo de Pneu</label>
              <select className="input" value={newCar.pneu} onChange={e => setNewCar({...newCar, pneu: e.target.value})}>
                <option value="Rua">Rua</option>
                <option value="Semislick">Semislick</option>
                <option value="Slick">Slick</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>SALVAR NA GARAGEM</button>
              <button type="button" className="btn-primary" style={{ background: 'var(--bg-tertiary)', color: '#fff' }} onClick={() => setShowAddCar(false)}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      {cars.length === 0 && !showAddCar ? (
        <div className="empty-state animate-in">
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
            <CarFront size={64} color="var(--text-muted)" />
          </div>
          <h2 className="title" style={{ justifyContent: 'center' }}>Sua garagem está vazia</h2>
          <p className="subtitle" style={{ marginBottom: '2rem' }}>Comece adicionando seu primeiro projeto para entrar nos rankings.</p>
          <button className="btn-primary" onClick={() => setShowAddCar(true)}>CRIAR MEU PRIMEIRO PROJETO</button>
        </div>
      ) : (
        <div className="section-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))' }}>
          {cars.map(car => (
            <div key={car.id} className="card animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                    PROJETO #{car.id.slice(-4)}
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-tech)' }}>{car.marca} <span style={{ color: 'var(--text-secondary)' }}>{car.modelo}</span></h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>{car.ano} • {car.pneu}</div>
                </div>
                <button onClick={() => removeCar(car.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div className="car-stat">
                  <span className="car-stat-label">Tração</span>
                  <span className="car-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Zap size={14} color="var(--accent-primary)"/> {car.tracao}</span>
                </div>
                <div className="car-stat">
                  <span className="car-stat-label">Potência</span>
                  <span className="car-stat-value">{car.cavalaria} <small style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>CV</small></span>
                </div>
                <div className="car-stat">
                  <span className="car-stat-label">Peso</span>
                  <span className="car-stat-value">{car.peso || '---'} <small style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>KG</small></span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Disc size={14} /> Histórico Mecânico
                  </div>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem' }} onClick={() => setActiveMaintenanceCar(activeMaintenanceCar === car.id ? null : car.id)}>
                    {activeMaintenanceCar === car.id ? 'FECHAR' : '+ LOG'}
                  </button>
                </div>

                {activeMaintenanceCar === car.id && (
                  <form onSubmit={(e) => handleAddMaintenance(e, car.id)} className="animate-in" style={{ marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select className="input" style={{ flex: 1, padding: '0.5rem' }} value={newMaintenance.type} onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value})}>
                        <option value="Mecânica">Mecânica</option>
                        <option value="Elétrica">Elétrica</option>
                        <option value="Pneus">Pneus/Rodas</option>
                        <option value="Fluídos">Fluídos</option>
                      </select>
                      <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }}>OK</button>
                    </div>
                    <input required className="input" style={{ padding: '0.5rem' }} placeholder="Descrição do serviço..." value={newMaintenance.description} onChange={e => setNewMaintenance({...newMaintenance, description: e.target.value})} />
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {car.maintenances && car.maintenances.length > 0 ? (
                    car.maintenances.slice(-3).reverse().map(m => (
                      <div key={m.id} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px', borderLeft: `2px solid ${m.type === 'Mecânica' ? 'var(--accent-primary)' : 'var(--warning)'}` }}>
                        <span style={{ fontWeight: '600' }}>{m.description}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(m.date).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum log disponível.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
