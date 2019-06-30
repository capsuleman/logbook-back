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

// CORS
app.use(cors());


// Routes
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var messageRouter = require('./routes/message');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/message', messageRouter);


// Database access with DAO
var dao = new AppDAO('./db/main.db')

dao.run(`CREATE TABLE IF NOT EXISTS user (
        username TEXT,
        password TEXT,
        key TEXT
    )`);

dao.run(`CREATE TABLE IF NOT EXISTS message (
        userid INT,
        target DATE,
        message TEXT,
        post DATETIME
    )`);


app.listen(config.web.port || 8080);