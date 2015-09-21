// packages and stuff to make my life easier
var express = require('express');
var cons = require('consolidate');
var moment = require('moment');

// server
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

// initializing swig
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');

// static includes
app.use(express.static(__dirname+'/public'));


/* ***********************************************

                     ROUTING

*********************************************** */
app.get('/nicchat', function(req, res) {
    res.render('chat/chat', {title: 'nicchat'});
});

app.get('*', function(req,res) {
    res.status(404).render('error/404', {title:'Not Found'});
});
// ***********************************************


// Socket.io handling for nicchat
io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('message', function(msgData) {
        msgData.timestamp = moment().format('h:mm a');
        io.emit('message', msgData);
    })
});


// start server
server.listen(80, function() {
    console.log('Server listening on port 80');
});