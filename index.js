// packages and stuff to make my life easier
var express = require('express');
var cons = require('consolidate');
var moment = require('moment');

// server
var app = express();
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var PORT = 9000;

// initializing swig
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// static includes
app.use(express.static(__dirname + '/public'));

/* ***********************************************

                     ROUTING

*********************************************** */
app.get('/chat', function(req, res) {
    res.render('chat/chat', { title: 'nicchat' });
});

app.get('*', function(req,res) {
    res.status(404).render('error/404', { title:'Not Found' });
});
// ***********************************************


// Socket.io handling for nicchat
io.on('connection', function(socket) {
    console.log('user connected');
    io.emit('message', { sender:'console', type:'server', text:'user connected' });

    socket.on('disconnect', function() {
        console.log('user disconnected');
        io.emit('message', { sender:'console', type:'server', text:'user disconnected' });
    });

    socket.on('message', function(msgData) {
        msgData.timestamp = moment().format('h:mm a');
        if(/^[a-zA-Z0-9][a-zA-Z0-9_]{2,16}$/.test(msgData.sender) && msgData.text !== '' && ['client', 'server'].indexOf(msgData.type) > -1) io.emit('message', msgData);
    })
});


// start server
server.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});
