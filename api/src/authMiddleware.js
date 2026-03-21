const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no token is provided, we set a default "Guest" user (ID 1 as seen in db.js)
    req.user = { id: '1', name: 'Piloto Visitante', email: 'guest@racing.com' };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, we still allow access as Guest
    req.user = { id: '1', name: 'Piloto Visitante', email: 'guest@racing.com' };
    next();
  }
};

module.exports = authMiddleware;
