var express = require('express');
var morgan = require('morgan')
var cors = require('cors');
var rfs = require('rotating-file-stream')
var AppDAO = require('./dao');
var config = require('./config');


var app = express();

// Morgan logs
if (config.log.output) {
    // create a rotating write stream
    var accessLogStream = rfs('access.log', {
        interval: '1d', // rotate daily
        path: 'logs'
    })

    // setup the logger
    app.use(morgan(config.log.type, { stream: accessLogStream }))

} else {
    app.use(morgan(config.log.type))
}

app.use(cors());


var dao = new AppDAO('./db/main.db')

dao.run(`CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY NOT NULL,
        username TEXT,
        password TEXT,
        key TEXT
    )`);

dao.run(`CREATE TABLE IF NOT EXISTS message (
        id INT PRIMARY KEY NOT NULL,
        userid INT,
        message TEXT,
        post DATETIME,
        target DATETIME
    )`);


app.get('/', function (req, res) {
    return res.send('Hello world');
});

app.listen(config.web.port || 8080);