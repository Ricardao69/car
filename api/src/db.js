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
  
  // Custom mock data for posts
  db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
    if (row.count === 0) {
      db.run(`
        INSERT INTO posts (userId, content) VALUES
        ('1', 'Ansioso para o trackday deste final de semana!'),
        ('1', 'Alguém recomenda uma boa oficina especializada em suspensão na zona sul?'),
        ('1', 'Instalei os pneus slick, a diferença de grip é absurda! 🔥')
      `);
    }
  });

    console.log('Database tables verified/created successfully.');
  });
}

module.exports = db;
