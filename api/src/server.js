require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json());

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Racing Manager API is running securely.' });
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });

  try {
    const checkUser = () => new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    const userExists = await checkUser();
    if (userExists) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = Date.now().toString();

    db.run(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashedPassword],
      function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar usuário.' });
        
        const token = jwt.sign({ id, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Piloto registrado com sucesso', token, user: { id, name, email, cnhStatus: 'Provisória', avatarUrl: null } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login realizado com sucesso', token, user: userWithoutPassword });
  });
});

const authMiddleware = require('./authMiddleware');

// --- Garage Routes ---
app.get('/api/garage', authMiddleware, (req, res) => {
  db.all('SELECT * FROM cars WHERE userId = ?', [req.user.id], (err, cars) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar carros.' });
    
    // For each car, we need its maintenance. Since it's MVP, we can do parallel queries or a join.
    // Let's do a simple approach: fetch all maintenances for the user's cars.
    db.all(`SELECT m.* FROM maintenance m JOIN cars c ON m.carId = c.id WHERE c.userId = ?`, [req.user.id], (err, maintenances) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar manutenções.' });
      
      const carsWithMaintenance = cars.map(car => ({
        ...car,
        maintenances: maintenances.filter(m => m.carId === car.id)
      }));
      res.json(carsWithMaintenance);
    });
  });
});

app.post('/api/garage', authMiddleware, (req, res) => {
  const { marca, modelo, tracao, cavalaria, peso, ano, pneu } = req.body;
  const id = Date.now().toString();

  db.run(
    'INSERT INTO cars (id, userId, marca, modelo, tracao, cavalaria, peso, ano, pneu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, marca, modelo, tracao, cavalaria, peso, ano, pneu],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao adicionar carro.' });
      res.status(201).json({ id, userId: req.user.id, marca, modelo, tracao, cavalaria, peso, ano, pneu, maintenances: [] });
    }
  );
});

app.delete('/api/garage/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM maintenance WHERE carId = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar manutenção.' });
    db.run('DELETE FROM cars WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar carro.' });
      res.json({ message: 'Carro removido.' });
    });
  });
});

app.post('/api/garage/:id/maintenance', authMiddleware, (req, res) => {
  const { type, description } = req.body;
  const maintenanceId = Date.now().toString();

  db.run(
    'INSERT INTO maintenance (id, carId, type, description) VALUES (?, ?, ?, ?)',
    [maintenanceId, req.params.id, type, description],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao registrar manutenção.' });
      res.status(201).json({ id: maintenanceId, carId: req.params.id, type, description, date: new Date().toISOString() });
    }
  );
});

app.delete('/api/garage/:carId/maintenance/:maintId', authMiddleware, (req, res) => {
  db.run('DELETE FROM maintenance WHERE id = ?', [req.params.maintId], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao remover manutenção.' });
    res.json({ message: 'Manutenção removida.' });
  });
});

// --- Lap Times Routes ---
app.get('/api/laps', authMiddleware, (req, res) => {
  db.all('SELECT * FROM laptimes ORDER BY totalMillis ASC', [], (err, laps) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar tempos.' });
    res.json(laps);
  });
});

app.post('/api/laps', authMiddleware, (req, res) => {
  const { carId, carName, carTracao, carCavalaria, track, timeMinutes, timeSeconds, timeMillis, totalMillis, trackCondition, notes } = req.body;
  const id = Date.now().toString();

  db.run(
    `INSERT INTO laptimes (id, userId, userName, carId, carName, carTracao, carCavalaria, track, timeMinutes, timeSeconds, timeMillis, totalMillis, trackCondition, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.id, req.user.name, carId, carName, carTracao, carCavalaria, track, timeMinutes, timeSeconds, timeMillis, totalMillis, trackCondition, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao registrar tempo.' });
      res.status(201).json({ id, userId: req.user.id, userName: req.user.name, carId, carName, carTracao, carCavalaria, track, timeMinutes, timeSeconds, timeMillis, totalMillis, trackCondition, notes, date: new Date().toISOString() });
    }
  );
});

app.delete('/api/laps/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM laptimes WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar tempo.' });
    res.json({ message: 'Tempo deletado.' });
  });
});

// --- POSTS (Feed) ENDPOINTS ---

// Get all posts for the community feed with user info and primary car
app.get('/api/posts', authMiddleware, (req, res) => {
  const search = req.query.search || '';
  const searchClause = search ? `AND p.content LIKE '%' || ? || '%'` : '';
  const params = search ? [req.user.id, search] : [req.user.id];

  const query = `
    SELECT 
      p.*, 
      u.name as userName,
      u.avatarUrl as userAvatar,
      (SELECT GROUP_CONCAT(c.marca || ' ' || c.modelo, ' / ') FROM cars c WHERE c.userId = p.userId LIMIT 1) as mainCar,
      (SELECT COUNT(*) FROM comments com WHERE com.postId = p.id) as commentCount,
      (SELECT COUNT(*) FROM likes lk WHERE lk.postId = p.id) as likeCount,
      (SELECT COUNT(*) FROM likes lk WHERE lk.postId = p.id AND lk.userId = ?) as likedByMe
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE 1=1 ${searchClause}
    ORDER BY p.createdAt DESC
  `;
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a new post
app.post('/api/posts', authMiddleware, (req, res) => {
  const { content, imageUrl } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo é obrigatório' });

  db.run(
    'INSERT INTO posts (userId, content, imageUrl) VALUES (?, ?, ?)',
    [req.user.id, content, imageUrl],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, userId: req.user.id, content, imageUrl, createdAt: new Date() });
    }
  );
});

// Delete a post (only author)
app.delete('/api/posts/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM likes WHERE postId = ?', [req.params.id]);
  db.run('DELETE FROM comments WHERE postId = ?', [req.params.id]);
  db.run('DELETE FROM posts WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(403).json({ error: 'Sem permissão' });
    res.json({ message: 'Post deletado.' });
  });
});

// Toggle like on a post
app.post('/api/posts/:id/like', authMiddleware, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  db.get('SELECT id FROM likes WHERE postId = ? AND userId = ?', [postId, userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      // Unlike
      db.run('DELETE FROM likes WHERE postId = ? AND userId = ?', [postId, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT COUNT(*) as count FROM likes WHERE postId = ?', [postId], (err, result) => {
          res.json({ liked: false, likeCount: result.count });
        });
      });
    } else {
      // Like
      db.run('INSERT INTO likes (postId, userId) VALUES (?, ?)', [postId, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT COUNT(*) as count FROM likes WHERE postId = ?', [postId], (err, result) => {
          res.json({ liked: true, likeCount: result.count });
        });
      });
    }
  });
});

// Get comments for a post
app.get('/api/posts/:postId/comments', authMiddleware, (req, res) => {
  const query = `
    SELECT c.*, u.name as userName, u.avatarUrl as userAvatar
    FROM comments c
    JOIN users u ON c.userId = u.id
    WHERE c.postId = ?
    ORDER BY c.createdAt ASC
  `;
  db.all(query, [req.params.postId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a comment to a post
app.post('/api/posts/:postId/comments', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comentário não pode ser vazio' });

  db.run(
    'INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)',
    [req.params.postId, req.user.id, content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, postId: req.params.postId, userId: req.user.id, content, createdAt: new Date() });
    }
  );
});

// --- Events Routes ---
app.get('/api/events', authMiddleware, (req, res) => {
  db.all('SELECT * FROM events ORDER BY date ASC, time ASC', [], (err, events) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar eventos.' });
    // Parse rsvps JSON for each event
    const parsed = events.map(e => ({
      ...e,
      rsvps: (() => { try { return JSON.parse(e.rsvps || '[]'); } catch { return []; } })()
    }));
    res.json(parsed);
  });
});

app.post('/api/events', authMiddleware, (req, res) => {
  const { title, date, time, location, rules } = req.body;
  const id = Date.now().toString();

  db.run(
    `INSERT INTO events (id, organizerId, organizerName, title, date, time, location, rules, rsvps) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]')`,
    [id, req.user.id, req.user.name, title, date, time, location, rules],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar evento.' });
      res.status(201).json({ id, organizerId: req.user.id, organizerName: req.user.name, title, date, time, location, rules, rsvps: [], createdAt: new Date().toISOString() });
    }
  );
});

// Toggle RSVP for an event
app.post('/api/events/:id/rsvp', authMiddleware, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const userName = req.user.name;

  db.get('SELECT rsvps FROM events WHERE id = ?', [eventId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Evento não encontrado' });

    let rsvps = [];
    try { rsvps = JSON.parse(row.rsvps || '[]'); } catch { rsvps = []; }

    const existingIdx = rsvps.findIndex(r => r.userId === userId);
    let confirmed;
    if (existingIdx >= 0) {
      rsvps.splice(existingIdx, 1);
      confirmed = false;
    } else {
      rsvps.push({ userId, userName });
      confirmed = true;
    }

    db.run('UPDATE events SET rsvps = ? WHERE id = ?', [JSON.stringify(rsvps), eventId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ confirmed, rsvps });
    });
  });
});

// Edit event (only organizer)
app.put('/api/events/:id', authMiddleware, (req, res) => {
  const { title, date, time, location, rules } = req.body;
  db.run(
    'UPDATE events SET title = ?, date = ?, time = ?, location = ?, rules = ? WHERE id = ? AND organizerId = ?',
    [title, date, time, location, rules, req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao editar evento.' });
      if (this.changes === 0) return res.status(403).json({ error: 'Sem permissão' });
      res.json({ message: 'Evento atualizado.' });
    }
  );
});

app.delete('/api/events/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM events WHERE id = ? AND organizerId = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar evento.' });
    res.json({ message: 'Evento deletado.' });
  });
});

// --- Profile Update Route ---
app.put('/api/users/profile', authMiddleware, (req, res) => {
  const { name, cnhStatus, avatarUrl } = req.body;
  db.run(
    'UPDATE users SET name = ?, cnhStatus = ?, avatarUrl = ? WHERE id = ?',
    [name, cnhStatus, avatarUrl, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
      res.json({ message: 'Perfil atualizado.' });
    }
  );
});

// --- Public User Profile ---
app.get('/api/users/:id/profile', authMiddleware, (req, res) => {
  const userId = req.params.id;
  db.get('SELECT id, name, avatarUrl, cnhStatus, createdAt FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    db.all('SELECT marca, modelo, tracao, cavalaria, ano FROM cars WHERE userId = ?', [userId], (err, cars) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all('SELECT track, carName, timeMinutes, timeSeconds, timeMillis, totalMillis FROM laptimes WHERE userId = ? ORDER BY totalMillis ASC LIMIT 5', [userId], (err, laps) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all('SELECT id, title, date, location FROM events WHERE organizerId = ? ORDER BY date DESC', [userId], (err, organizedEvents) => {
          if (err) return res.status(500).json({ error: err.message });

          db.all('SELECT id, content, imageUrl, createdAt, (SELECT COUNT(*) FROM likes l WHERE l.postId = posts.id) as likeCount FROM posts WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, posts) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ 
              ...user, 
              cars, 
              bestLaps: laps,
              organizedEvents,
              posts
            });
          });
        });
      });
    });
  });
});

// --- Real Stats Endpoint ---
app.get('/api/stats', authMiddleware, (req, res) => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  db.get('SELECT COUNT(*) as count FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT COUNT(*) as count FROM cars', (err, cars) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT COUNT(*) as count FROM laptimes WHERE date >= ?', [oneWeekAgo], (err, weekRecords) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT COUNT(*) as count FROM posts', (err, posts) => {
          if (err) return res.status(500).json({ error: err.message });
          db.get('SELECT COUNT(*) as count FROM events', (err, events) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
              pilotos: users.count,
              maquinas: cars.count,
              recordesSemana: weekRecords.count,
              posts: posts.count,
              eventos: events.count
            });
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
