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
  const query = `
    SELECT 
      p.*, 
      u.name as userName,
      (SELECT GROUP_CONCAT(c.marca || ' ' || c.modelo, ' / ') FROM cars c WHERE c.userId = p.userId LIMIT 1) as mainCar
    FROM posts p
    JOIN users u ON p.userId = u.id
    ORDER BY p.createdAt DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a new post
app.post('/api/posts', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo é obrigatório' });

  db.run(
    'INSERT INTO posts (userId, content) VALUES (?, ?)',
    [req.user.id, content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, userId: req.user.id, content, createdAt: new Date() });
    }
  );
});

// --- Events Routes ---
app.get('/api/events', authMiddleware, (req, res) => {
  db.all('SELECT * FROM events ORDER BY date ASC, time ASC', [], (err, events) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar eventos.' });
    res.json(events);
  });
});

app.post('/api/events', authMiddleware, (req, res) => {
  const { title, date, time, location, rules } = req.body;
  const id = Date.now().toString();

  db.run(
    `INSERT INTO events (id, organizerId, organizerName, title, date, time, location, rules) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.id, req.user.name, title, date, time, location, rules],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar evento.' });
      res.status(201).json({ id, organizerId: req.user.id, organizerName: req.user.name, title, date, time, location, rules, createdAt: new Date().toISOString() });
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
