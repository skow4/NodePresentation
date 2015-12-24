// Modules
var range = require('./range');
var express = require("express");
var app = express();
var port = 8000;
var _slide = 1;
var masterPresenterId = null;
var presenters = {};

// Setup the application
app.set('views', __dirname + '/views');
app.set('view engine', "ejs");
app.engine('html', require('ejs').__express);
app.get("/", function(req, res){
    res.render("index.html");
});
app.use(express.static(__dirname + '/public'));

// WebSockets!!!
var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {
    presenters[socket.id] = { address: io.eio.clients[socket.id].remoteAddress }

    if(socket.handshake.headers.host === socket.handshake.address + ':' + port){ 
        masterPresenterId = socket.id; 
        presenters[masterPresenterId].isMaster = true;
    };

    io.sockets.connected[masterPresenterId].emit('updateSockets', presenters);

    socket.emit('render', { slide: _slide });

    socket.on('changeSlide', function(data){
    	if(masterPresenterId === socket.id || presenters[socket.id].isPresenter === true){
    		_slide = range(_slide, data.direction);
    		io.sockets.emit('render', { slide: _slide});
    	}
    });

    socket.on('change-presenters', function(data){
        if(masterPresenterId === socket.id){
            if(data.type === 'add'){
                presenters[data.id] = { address: io.eio.clients[data.id].remoteAddress, isPresenter: true };
                io.sockets.connected[data.id].emit('message', { message: 'You have been promoted to presenter.' });
            }
            else{
                presenters[data.id].isPresenter = false;
                io.sockets.connected[data.id].emit('message', { message: 'You have lost your presentation privileges.' });
            }
        }
    });

    socket.on('disconnect', function () {
        delete(presenters[socket.id]);
        if(socket.id !== masterPresenterId){
            io.sockets.connected[masterPresenterId].emit('updateSockets', presenters);
        }
  	});
});
console.log("Listening on port " + port);