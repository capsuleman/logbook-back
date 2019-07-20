var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var AppDAO = require('../dao')
var dao = new AppDAO('./db/main.db')

var VerifyToken = require('../VerifyToken');


// ADD MESSAGE
router.post('/', VerifyToken, function (req, res) {
    if (!req.body.target.match(/^\d{4}-\d{2}-\d{2}$/)) { return res.status(400).send('Bad format for target date (YYY-MM-DD)') }

    var now = new Date();
    var isoString = now.toISOString().substring(0, 19);

    dao.run('INSERT INTO message (userid, message, post, target) VALUES (?, ?, ?, ?)', [req.userId, req.body.message, isoString, req.body.target])
        .then(rep => { return res.status(200).json(rep.id) })
        .catch(_ => { return res.status(500).send('Error on the server.') })
})


// GET TARGET DATES
router.get('/date', VerifyToken, function (req, res) {
    dao.all('SELECT DISTINCT target FROM message WHERE userid = ? ORDER BY target', [req.userId])
        .then(ans => res.status(200).json(ans.map(elt => elt.target)))
        .catch(_ => { return res.status(500).send('Error on the server.') })
})


// GET MESSAGE
router.get('/:date', VerifyToken, function (req, res) {
    if (!req.params.date.match(/^\d{4}-\d{2}-\d{2}$/)) { return res.status(400).send('Bad format for target date (YYYY-MM-DD)') }

    dao.all('SELECT rowid, message, post FROM message WHERE userid = ? AND target = ? ORDER BY post', [req.userId, req.params.date])
        .then((ans) => {
            res.status(200).json(ans)
        })
})


// REMOVE MESSAGE
router.delete('/:id', VerifyToken, function (req, res) {
    dao.get('SELECT COUNT(*) AS nb FROM message WHERE rowid = ? AND userid = ?', [req.params.id, req.userId])
        .then((ans) => {
            if (ans.nb == 0) throw 'messageNotFound';
            return dao.run('DELETE FROM message WHERE rowid = ? AND userid = ?', [req.params.id, req.userId])
        })
        .then(() => {
            res.status(200).send();
        })
        .catch(err => {
            if (err = 'messageNotFound') return res.status(404).send('Message not found.');
            return res.status(500).send('There was a problem registering the user.');
        })
})


module.exports = router;