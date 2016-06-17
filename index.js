var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*global.document = document;
global.Phaser = Phaser = require('Phaser/build/custom/phaser-arcade-physics');*/

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var firebaseDB = require('./firebase.js');

var player1status = false;
var player1uuid;
var player2status = false;
var player2uuid;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use("/assets", express.static(__dirname + '/assets'));
//app.use(express.static(__dirname));

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('connectOK', 'OK');
  socket.on('disconnect', function(){
    console.log('user disconnected');
	player1status = false;
	player2status = false;
	io.emit(player1uuid, 'checkConnect');
	io.emit(player2uuid, 'checkConnect');
  });
  //=====Android to Web
  socket.on('message', function(msg){
	if(msg == 'fire'){
		io.emit('shoot', msg);
	}else if(msg == 'start'){
		io.emit('start', msg);
	}
  });
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
  socket.on('X', function(msg){
	   io.emit('setX', msg);
  });
  socket.on('Y', function(msg){
	   io.emit('setY', msg);
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
  socket.on('ultra', function(msg){
	   if(msg == 'start') io.emit('start', msg);
	    else io.emit('ultra', msg);
  });
  socket.on('switch_weapon', function(msg){
	   io.emit('switch_weapon', msg);
  });
  socket.on('data', function(data){
	   SaveToDB(data);
  });
  //=====

  //=====Web to Android
  socket.on('vibrate', function(msg){
	   io.emit('connectOK', msg);
  });
  socket.on('ULT', function(msg){
	   io.emit('connectOK', msg);
  });
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
		//server to web
		io.emit('players', '2');
	}else if(!player2status){
		player2status = true;
		player2uuid = msg;
		io.emit(player2uuid, 'player2');
		io.emit(player1uuid, 'ready');
		io.emit(player2uuid, 'ready');
		//server to web
		io.emit('players', 'go');
	}else{
		io.emit(msg, 'full');
	}
  });
  socket.on('stillConnect', function(msg){
	if(msg == player1uuid){
		player1status = true;
	}
	if(msg == player2uuid){
		player2status = true;
	}
  });
  //=====
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var scoreBoard;

firebaseDB.scoresRef.orderByChild("score").limitToLast(10).on("value", function(snapshot) {

  var count = snapshot.numChildren();
  scoreBoard = '';
  snapshot.forEach(function(data) {
    var user = data.val();
    //console.log("The " + user.name + "'s score is " + user.score);
    scoreBoard = count + ((count == 10)?' ' : '  ') + user.name + ' ' + user.score + '\n' + scoreBoard;
    count --;
  });

});

function SaveToDB(data) {
  firebaseDB.updateScore({
    name: data.name,
    score: parseInt(data.score),
    time: data.time
  });
  console.log('int save to db');
  io.emit("scoreBoard", scoreBoard);
}
