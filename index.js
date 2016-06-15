var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*global.document = document;
global.Phaser = Phaser = require('Phaser/build/custom/phaser-arcade-physics');*/

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use("/assets", express.static(__dirname + '/assets'));

/*app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
  console.log('get');
});*/

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('connectOK', 'OK');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('message', function(msg){
    //console.log('message: ' + msg);
	if(msg == 'fire'){
		io.emit('shoot', msg);
	}else if(msg == 'start'){
		io.emit('start', msg);
	}
  });
  socket.on('X', function(msg){
    //console.log('X: ' + msg);
	io.emit('setX', msg);
  });
  socket.on('Y', function(msg){
    //console.log('Y: ' + msg);
	io.emit('setY', msg);
  });
  socket.on('vibrate', function(msg){
	   io.emit('connectOK', msg);
  });
  socket.on('ULT', function(msg){
    //console.log('Y: ' + msg);
	   io.emit('connectOK', msg);
  });
  socket.on('ultra', function(msg){
	   if(msg == 'start') io.emit('start', msg);
	    else io.emit('ultra', msg);
  });
  /*socket.on('Z', function(msg){
    //console.log('Z: ' + msg);
	io.emit('connectOK', 'OK');
  });*/
  /*socket.on('zShift', function(msg){
    console.log('zShift: ' + msg);
    io.emit('change_zShift', {
        zShift: msg
    });
  });*/
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
