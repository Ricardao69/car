import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, Car, Clock } from 'lucide-react';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    // Auto-refresh feed every 10 seconds just for realistic feel (optional)
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newPost })
      });
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return `agora mesmo`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 className="hero-title">NO <span>PADDOCK</span></h1>
          <p className="subtitle">Mural da Comunidade: Combine trackdays, peça dicas e converse.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 800px) 1fr', gap: '3rem', margin: '0 auto', maxWidth: '1200px' }}>
        
        {/* Feed List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Post Form */}
          <div className="card animate-in" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-primary)', marginBottom: '1rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: 'var(--bg-tertiary)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)',
                fontWeight: '900', flexShrink: 0
              }}>
                {user?.name?.[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <textarea 
                  className="input"
                  style={{ minHeight: '80px', resize: 'vertical', width: '100%' }}
                  placeholder="O que está acontecendo na garagem hoje?"
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem' }} disabled={!newPost.trim()}>
                    <Send size={16} /> PUBLICAR
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Posts list */}
          {loading && posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Mapeando telemetria social...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p className="title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>PADDOCK VAZIO</p>
              <p className="subtitle">Seja o primeiro a puxar assunto com a comunidade.</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card animate-in" style={{ padding: '1.5rem 2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: 'var(--bg-tertiary)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', color: 'var(--text-secondary)'
                    }}>
                      {post.userName?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>{post.userName}</div>
                      {post.mainCar && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                          <Car size={12} color="var(--accent-primary)"/> {post.mainCar}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}>
                    <Clock size={12} /> {timeAgo(post.createdAt)}
                  </div>
                </div>
                <div style={{ paddingLeft: '3.5rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {post.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Info */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="title" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>REGRAS BÁSICAS</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong style={{ color: 'var(--accent-primary)' }}>1.</strong> O respeito prevalece. Este é um ambiente para entusiastas.</li>
              <li><strong style={{ color: 'var(--accent-primary)' }}>2.</strong> Proibido divulgar apologia a infrações de trânsito em vias públicas.</li>
              <li><strong style={{ color: 'var(--accent-primary)' }}>3.</strong> Use o mural para tirar dúvidas e combinar eventos com segurança.</li>
            </ul>
          </div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
             <img src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd" alt="Garage setup" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
             <div style={{ padding: '1rem', textAlign: 'center' }}>
               <p style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)' }}>FOTO DO DIA: @user123</p>
             </div>
          </div>
        </div>

      </div>
    </>
  );
}
