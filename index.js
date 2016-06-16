var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*global.document = document;
global.Phaser = Phaser = require('Phaser/build/custom/phaser-arcade-physics');*/

var player1status = false;
var player1uuid;
var player2status = false;
var player2uuid;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use("/assets", express.static(__dirname + '/assets'));

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('connectOK', 'OK');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  //=====Android to Web
  socket.on('message1', function(msg){
	if(msg == 'fire'){
		io.emit('shoot1', msg);
	}else if(msg == 'start'){
		io.emit('start1', msg);
	}
  });
  socket.on('message2', function(msg){
	if(msg == 'fire'){
		io.emit('shoot2', msg);
	}else if(msg == 'start'){
		io.emit('start2', msg);
	}
  });
  socket.on('X1', function(msg){
	   io.emit('setX1', msg);
  });
  socket.on('Y1', function(msg){
	   io.emit('setY1', msg);
  });
  socket.on('X2', function(msg){
	   io.emit('setX2', msg);
  });
  socket.on('Y2', function(msg){
	   io.emit('setY2', msg);
  });
  socket.on('ultra1', function(msg){
	   if(msg == 'start') io.emit('start', msg);
	    else io.emit('ultra1', msg);
  });
  socket.on('switch_weapon1', function(msg){
	   io.emit('switch_weapon1', msg);
  });
  socket.on('ultra2', function(msg){
	   if(msg == 'start') io.emit('start', msg);
	    else io.emit('ultra2', msg);
  });
  socket.on('switch_weapon2', function(msg){
	   io.emit('switch_weapon2', msg);
  });
  //=====
  
  //=====Web to Android
  socket.on('vibrate1', function(msg){
	   io.emit(player1uuid, msg);
  });
  socket.on('ULT1', function(msg){
	   io.emit(player1uuid, msg);
  });
  socket.on('vibrate2', function(msg){
	   io.emit(player2uuid, msg);
  });
  socket.on('ULT2', function(msg){
	   io.emit(player2uuid, msg);
  });
  //=====
  
  //=====Android to server  
  socket.on('requestPlayer', function(msg){
	if(msg == player1uuid || msg == player2uuid){return;}
	if(!player1status){
		player1status = true;
		player1uuid = msg;
		io.emit(player1uuid, 'player1');
	}else if(!player2status){
		player2status = true;
		player2uuid = msg;
		io.emit(player2uuid, 'player2');
	}else{
		io.emit(msg, 'full');
	}
  });
  //=====
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
