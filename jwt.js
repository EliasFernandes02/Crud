const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {

  const token = req.headers.authorization?.split(' ')[1];
  if (token == null) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, 'batata', (err, user) => {
    if (err) {
      return res.status(403).send('unauthorized');
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;