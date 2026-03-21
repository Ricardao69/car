const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      cnhStatus TEXT DEFAULT 'Provisória',
      avatarUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Cars Table
    db.run(`CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      tracao TEXT NOT NULL,
      cavalaria INTEGER NOT NULL,
      peso INTEGER,
      ano INTEGER,
      pneu TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Maintenance Table
    db.run(`CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      carId TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (carId) REFERENCES cars(id)
    )`);

    // Lap Times Table
    db.run(`CREATE TABLE IF NOT EXISTS laptimes (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      carId TEXT NOT NULL,
      carName TEXT NOT NULL,
      carTracao TEXT NOT NULL,
      carCavalaria INTEGER NOT NULL,
      track TEXT NOT NULL,
      timeMinutes TEXT NOT NULL,
      timeSeconds TEXT NOT NULL,
      timeMillis TEXT NOT NULL,
      totalMillis INTEGER NOT NULL,
      trackCondition TEXT,
      notes TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (carId) REFERENCES cars(id)
    )`);

    // Events Table
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      organizerId TEXT NOT NULL,
      organizerName TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      rules TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizerId) REFERENCES users(id)
    )`);

    // Posts Table
    db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // Default Events (with rsvps column added)
  db.run(`
    CREATE TABLE IF NOT EXISTS events_new (
      id TEXT PRIMARY KEY,
      organizerId TEXT NOT NULL,
      organizerName TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      rules TEXT NOT NULL,
      rsvps TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizerId) REFERENCES users(id)
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO events_new (id, organizerId, organizerName, title, date, time, location, rules, rsvps, createdAt)
    SELECT id, organizerId, organizerName, title, date, time, location, rules, '[]', createdAt FROM events;
  `);

  db.run(`DROP TABLE IF EXISTS events;`);
  db.run(`ALTER TABLE events_new RENAME TO events;`);

    // Default Events (inserting example data)
    db.run(`
      INSERT OR IGNORE INTO events (id, organizerId, organizerName, title, date, time, location, rules, rsvps)
      VALUES ('1', '1', 'Admin', 'Trackday Noturno', '2024-12-15', '20:00', 'Interlagos', 'Capacete obrigatório. Proibido drift.', '["1"]')
    `);

    // --- MOCK DATA FOR "LIVE" FEEL ---
    const mockUsers = [
      { id: 'u1', name: 'GTR_Master', email: 'gtr@track.com', pass: '123', fav: 'Nissan GT-R Nismo' },
      { id: 'u2', name: 'NitroQueen', email: 'nitro@track.com', pass: '123', fav: 'Porsche 911 GT3' },
      { id: 'u3', name: 'PistaBoy', email: 'pista@track.com', pass: '123', fav: 'Honda Civic Type R' },
      { id: 'u4', name: 'Alpine_Enthusiast', email: 'alpine@track.com', pass: '123', fav: 'Alpine A110S' },
    ];

    db.get("SELECT COUNT(*) as count FROM users WHERE id != '1'", (err, row) => {
      if (row && row.count === 0) {
        mockUsers.forEach(u => {
          db.run('INSERT INTO users (id, name, email, password, cnhStatus) VALUES (?, ?, ?, ?, ?)', 
            [u.id, u.name, u.email, '$2a$10$xyz', 'Piloto de Elite']);
          
          const carId = 'c_' + u.id;
          db.run('INSERT INTO cars (id, userId, marca, modelo, tracao, cavalaria, peso, ano, pneu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [carId, u.id, u.fav.split(' ')[0], u.fav.split(' ').slice(1).join(' '), 'AWD', 500, 1500, 2023, 'Slick']);
        });
      }
    });

    db.get("SELECT COUNT(*) as count FROM laptimes", (err, row) => {
      if (row && row.count === 0) {
        const mockLaps = [
          ['l1', 'u1', 'GTR_Master', 'c_u1', 'Nissan GT-R', 'AWD', 600, 'Interlagos', '1', '38', '452', 98452],
          ['l2', 'u2', 'NitroQueen', 'c_u2', 'Porsche 911 GT3', 'RWD', 510, 'Interlagos', '1', '39', '110', 99110],
          ['l3', 'u3', 'PistaBoy', 'c_u3', 'Honda Civic Type R', 'FWD', 320, 'Interlagos', '1', '45', '890', 105890],
          ['l4', 'u1', 'GTR_Master', 'c_u1', 'Nissan GT-R', 'AWD', 600, 'Velocitta', '1', '32', '200', 92200],
        ];
        mockLaps.forEach(l => {
          db.run(`INSERT INTO laptimes (id, userId, userName, carId, carName, carTracao, carCavalaria, track, timeMinutes, timeSeconds, timeMillis, totalMillis) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, l);
        });
      }
    });
    
    // Custom mock data for posts
    db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
      if (row && row.count <= 3) {
        db.run(`
          INSERT INTO posts (userId, content, createdAt) VALUES
          ('u1', 'A pista de Interlagos estava absurda hoje! Grip total na Curva do Sol.', date('now', '-2 hours')),
          ('u2', 'Finalmente baixei de 1:40 em Interlagos. O 911 GT3 é uma arma!', date('now', '-5 hours')),
          ('u3', 'Alguém indo para o Velocitta no próximo domingo?', date('now', '-1 day')),
          ('u4', 'Dica: Calibrem os pneus em 28 psi para o asfalto quente hoje.', date('now', '-3 days'))
        `);
      }
    });

    console.log('Database tables verified/created successfully with mock data.');
  });
}

module.exports = db;
