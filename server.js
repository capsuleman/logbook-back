var express = require('express');
var morgan = require('morgan')
var cors = require('cors');
var rfs = require('rotating-file-stream')
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
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "maxAge": 3600
}));


// Routes
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var messageRouter = require('./routes/message');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/message', messageRouter);


app.listen(config.web.port || 8080);
