var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var AppDAO = require('../dao')
var dao = new AppDAO('./db/main.db')

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var VerifyToken = require('../VerifyToken');

var config = require('../config');



// REGISTER NEW USER
// Everybody can create an account.
// Returns a JWT.
router.post('/register', function (req, res) {
    dao.get('SELECT * FROM user WHERE username = ?', [req.body.username])
        .then((user) => {
            if (user) throw 'alreadyRegistered';
            var hashedPassword = bcrypt.hashSync(req.body.password, 8);
            return dao.run('INSERT INTO user (username, password) VALUES (?, ?)', [req.body.username, hashedPassword]);
        })
        .then(ans => {
            var token = jwt.sign(
                { id: ans.id },
                config.cred.authsecret,
                { expiresIn: config.cred.delay }
            );
            return res.status(201).send({ auth: true, token: token, expiresIn: config.cred.delay });

        })
        .catch(err => {
            if (err == 'alreadyRegistered') return res.status(409).send('User is already registered.');
            return res.status(500).send('There was a problem registering the user.')
        })
});


// ACCESS TO USER INFORMATION
// Only the connected user can access to it.
router.get('/me', VerifyToken, function (req, res) {
    dao.get('SELECT rowid, username, key FROM user WHERE rowid = ?', [req.userId])
        .then(user => {
            if (!user) return res.status(404).send('No user found.');
            return res.status(200).send(user);
        })
        .catch(_ => { return res.status(500).send('There was a problem finding the user.') });
});


// LOGIN ROUTE
// username and password are required.
// Returns a JWT.
router.post('/login', function (req, res) {
    dao.get('SELECT rowid, * FROM user WHERE username = ?', [req.body.username])
        .then(user => {

            if (!user) return res.status(401).send({ auth: false, token: null });

            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

            var token = jwt.sign(
                { id: user.rowid },
                config.cred.authsecret,
                { expiresIn: config.cred.delay }
            );
            res.status(200).send({ auth: true, token: token, expiresIn: config.cred.delay });
        })
        .catch(_ => { return res.status(500).send('Error on the server.') })
});


// MODIFY CREDS
// JWT, username and password are required
router.post('/modifycreds', VerifyToken, function (req, res) {
    dao.get('SELECT * FROM user WHERE username = ?', [req.body.username])
        .then((user) => {
            if (user) throw 'alreadyUsed';
            var hashedPassword = bcrypt.hashSync(req.body.password, 8);
            return dao.run('UPDATE user SET username = ?, password = ? WHERE rowid = ?', [req.body.username, hashedPassword, req.userId])
        })
        .then(() => { return res.status(200).send() })
        .catch(err => {
            if (err == 'alreadyUsed') return res.status(409).send();
            return res.status(500).send()
        })
})


// TEST USERNAME
// just a username is required
router.get('/isfree/:username', function (req, res) {
    dao.get('SELECT * FROM user WHERE username = ?', [req.params.username])
        .then((user) => { return res.status(200).send(Boolean(user)) })
        .catch(_ => { return res.status(500).send() })
})


// MODIFY KEY ROUTE
// modify the key from the JWT user
router.post('/key', VerifyToken, function (req, res) {
    dao.run('UPDATE user SET key = ? WHERE rowid = ?', [req.body.key, req.userId])
        .then(() => { return res.status(200).send() })
        .catch(_ => { return res.status(500).send() })
})


// REMOVE KEY ROUTE
// delete the key from the JWT user
router.delete('/key', VerifyToken, function (req, res) {
    dao.run('UPDATE user SET key = ? WHERE rowid = ?', [null, req.userId])
        .then(() => { return res.status(200).send() })
        .catch(_ => { return res.status(500).send() })
})


module.exports = router;