var express = require('express');
var morgan = require('morgan')
var cors = require('cors');
var rfs = require('rotating-file-stream')
var sqlite3 = require('sqlite3').verbose();
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


let db = new sqlite3.Database('./db/main.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY NOT NULL,
        username TEXT,
        password TEXT,
        key TEXT
    )`);

db.run(`CREATE TABLE IF NOT EXISTS message (
        id INT PRIMARY KEY NOT NULL,
        userid INT,
        message TEXT,
        post DATETIME,
        target DATETIME
    )`);

db.close();




app.get('/', function (req, res) {
    return res.send('Hello world');
});

app.listen(config.web.port || 8080);