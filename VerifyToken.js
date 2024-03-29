var jwt = require('jsonwebtoken');
var config = require('./config');

function verifyToken(req, res, next) {


  if (!req.headers['authorization'])
    return res.status(403).send({ auth: false, message: 'No token provided.' });

  var token = req.headers['authorization'].substring(7);

  jwt.verify(token, config.cred.authsecret, function (err, decoded) {
    if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });

    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    req.username = decoded.username;

    next();
  });
}

module.exports = verifyToken;