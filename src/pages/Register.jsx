import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, UserPlus, CarFront } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ name, email, password });
    if (success) {
      navigate('/profile');
    } else {
      alert('Erro ao realizar cadastro.');
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center', minHeight: '100vh', paddingTop: 0 }}>
      <div className="card animate-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <CarFront size={48} />
          </div>
          <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Criar Conta</h1>
          <p className="subtitle">Junte-se à maior comunidade de pilotos.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">Nome Completo</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Como quer ser chamado?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">E-mail</label>
            <input 
              type="email" 
              className="input" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="label">Senha</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            FINALIZAR CADASTRO
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Já possui conta? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Fazer Login</Link>
        </p>
      </div>
    </div>
  );
}
