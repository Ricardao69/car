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
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // Ensure posts table has imageUrl column
  db.run(`ALTER TABLE posts ADD COLUMN imageUrl TEXT`, (err) => {
    // Ignore error if column already exists
  });

  // Comments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(postId) REFERENCES posts(id),
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

    // Sequential seeding to avoid race conditions
    db.get("SELECT COUNT(*) as count FROM users WHERE id != '1'", (err, row) => {
      if (err) console.error('Error counting users:', err.message);
      
      const insertUsers = () => {
        return new Promise((resolve) => {
          if (row && row.count === 0) {
            console.log('Inserting mock users...');
            let completed = 0;
            mockUsers.forEach(u => {
              db.run('INSERT INTO users (id, name, email, password, cnhStatus) VALUES (?, ?, ?, ?, ?)', 
                [u.id, u.name, u.email, '$2a$10$xyz', 'Piloto de Elite'], (err) => {
                  if (err) console.error(`Error inserting mock user ${u.name}:`, err.message);
                  const carId = 'c_' + u.id;
                  db.run('INSERT INTO cars (id, userId, marca, modelo, tracao, cavalaria, peso, ano, pneu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [carId, u.id, u.fav.split(' ')[0], u.fav.split(' ').slice(1).join(' '), 'AWD', 500, 1500, 2023, 'Slick'], () => {
                      completed++;
                      if (completed === mockUsers.length) resolve();
                    });
                });
            });
          } else {
            resolve();
          }
        });
      };

      insertUsers().then(() => {
        // Now insert posts
        db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
          if (row && row.count <= 4) {
            console.log('Inserting mock posts and comments...');
            db.serialize(() => {
              db.run("DELETE FROM posts");
              db.run("DELETE FROM comments");
              
              const mockPosts = [
                ['u1', 'A pista de Interlagos estava absurda hoje! Grip total na Curva do Sol.', 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=1000&auto=format&fit=crop'],
                ['u2', 'Finalmente baixei de 1:40 em Interlagos. O 911 GT3 é uma arma!', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'],
                ['u3', 'Alguém indo para o Velocitta no próximo domingo? Quero testar o novo set de pneus.', null],
                ['u4', 'Dica: Calibrem os pneus em 28 psi para o asfalto quente hoje.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop'],
                ['u1', 'Novo setup de suspensão instalado no GT-R. A diferença é brutal!', 'https://images.unsplash.com/photo-1566274360936-692e1ec40da4?q=80&w=1000&auto=format&fit=crop']
              ];

              mockPosts.forEach((p, idx) => {
                db.run('INSERT INTO posts (userId, content, imageUrl) VALUES (?, ?, ?)', p, function(err) {
                  if (err) {
                    console.error('Error inserting mock post:', err.message);
                    return;
                  }
                  const postId = this.lastID;
                  if (idx === 0) {
                    db.run('INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)', [postId, 'u2', 'Concordo! Aquela curva é mágica.']);
                    db.run('INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)', [postId, 'u3', 'Tava lá também! Vi seu carro, tá andando muito.']);
                  } else if (idx === 1) {
                    db.run('INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)', [postId, 'u1', 'Tempo animal! Parabéns pelo recorde pessoal.']);
                  }
                });
              });
            });
          }
        });

        // Now insert extra laps
        db.get("SELECT COUNT(*) as count FROM laptimes", (err, row) => {
          if (row && row.count <= 4) {
             const extraLaps = [
              ['l5', 'u4', 'Alpine_Enthusiast', 'c_u4', 'Alpine A110S', 'RWD', 300, 'Interlagos', '1', '41', '500', 101500],
              ['l6', 'u2', 'NitroQueen', 'c_u2', 'Porsche 911 GT3', 'RWD', 510, 'Velocitta', '1', '29', '340', 89340]
            ];
            extraLaps.forEach(l => {
              db.run(`INSERT OR IGNORE INTO laptimes (id, userId, userName, carId, carName, carTracao, carCavalaria, track, timeMinutes, timeSeconds, timeMillis, totalMillis) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, l);
            });
          }
        });
      });
    });

    console.log('Database initialization scripts scheduled.');
  });
}

module.exports = db;
