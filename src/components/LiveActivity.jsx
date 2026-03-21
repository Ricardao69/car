import React from 'react';
import { Activity, Users, MapPin } from 'lucide-react';

export default function LiveActivity() {
  const mockActivities = [
    { id: 1, user: 'GTR_Master', action: 'entrou no paddock', icon: <Users size={14} />, time: 'agora' },
    { id: 2, user: 'NitroQueen', action: 'registrou 1:39.110', icon: <Activity size={14} />, time: '2m atrás' },
    { id: 3, user: 'PistaBoy', action: 'postou na garagem', icon: <MapPin size={14} />, time: '5m atrás' },
  ];

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
        <h3 className="title" style={{ fontSize: '0.9rem', marginBottom: 0 }}>ATIVIDADE AO VIVO</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {mockActivities.map(act => (
          <div key={act.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '2px' }}>{act.icon}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: '800', color: '#fff' }}>@{act.user}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>{act.action}</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '700', opacity: 0.6 }}>{act.time.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          12 PILOTOS ONLINE AGORA
        </span>
      </div>
    </div>
  );
}
