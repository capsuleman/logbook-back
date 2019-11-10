var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var VerifyToken = require('../VerifyToken');

var config = require('../config');

var dao = require('../dao')


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
        .then(() => {
            return dao.get('SELECT * FROM user WHERE username = ?', [req.body.username]);
        })
        .then(user => {
            var token = jwt.sign(
                { id: user.rowid },
                config.cred.authsecret,
                { expiresIn: config.cred.delay }
            );
            return res.status(201).send({ auth: true, token: token, expiresIn: config.cred.delay });

        })
        .catch(err => {
            console.log(err);
            if (err == 'alreadyRegistered') return res.status(409).send();
            return res.status(500).send()
        })
});


// ACCESS TO USER INFORMATION
// Only the connected user can access to it.
router.get('/me', VerifyToken, function (req, res) {
    dao.get('SELECT rowid, username, pubkey FROM user WHERE rowid = ?', [req.userId])
        .then(user => {

            if (!user) return res.status(404).send();
            return res.status(200).send(user);
        })
        .catch(_ => { return res.status(500).send() });
});


// LOGIN ROUTE
// username and password are required.
// Returns a JWT.
router.post('/login', function (req, res) {
    dao.get('SELECT * FROM user WHERE username = ?', [req.body.username])
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
        .catch(_ => { return res.status(500).send() })
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
    dao.get('SELECT COUNT(*) as c FROM user WHERE username = ?', [req.params.username])
        .then((rep) => { return res.status(200).send(String(rep.c)) })
        .catch(_ => { return res.status(500).send() })
})


// MODIFY KEY ROUTE
// modify the key from the JWT user
router.post('/key', VerifyToken, function (req, res) {
    dao.run('UPDATE user SET pubkey = ? WHERE rowid = ?', [req.body.key, req.userId])
        .then(() => { return res.status(200).send() })
        .catch(_ => { return res.status(500).send() })
})


// REMOVE KEY ROUTE
// delete the key from the JWT user
router.delete('/key', VerifyToken, function (req, res) {
    dao.run('UPDATE user SET pubkey = ? WHERE rowid = ?', [null, req.userId])
        .then(() => { return res.status(200).send() })
        .catch(_ => { return res.status(500).send() })
})


module.exports = router;