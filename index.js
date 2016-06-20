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

var player1status = new Array();
var player1uuid = new Array();
var player2status = new Array();
var player2uuid = new Array();

var Magics = new Array();

var crypto = require('crypto');
function random (howMany, chars) {
    chars = chars
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use("/assets", express.static(__dirname + '/assets'));
//app.use(express.static(__dirname));

io.on('connection', function(socket){
  console.log('a user connected');

  // first time shake hand, magic number on web
  // mobile <=> server
  socket.on('magic', function(magic) {
    console.log('magic = %s', String(magic));
    // check magic number is exist or not
    if( Magics.indexOf(String(magic)) > -1 )  {
      io.emit('connectOK', 'OK');
      socket.mobileMagic = String(magic);
      addMobileOwnSocket(socket, String(magic));
    }else {
      io.emit('connectOK', 'Failed');
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
	var index = Magics.indexOf(socket.magic)
	if( index > -1 ){
		player1status[index] = false;
		player2status[index] = false;
		io.emit(player1uuid[index], 'checkConnect');
		io.emit(player2uuid[index], 'checkConnect');
	}
    if( socket.magic != null )  {
      var id = Magics.indexOf(socket.magic);
      Magics.splice(id, 1);
    }
  });

  // Web to server
  socket.on('reqMagic', function()  {
    var magic = random(5);
    // TODO: check duplication of random string
    console.log('random magic = %s', String(magic));
    io.emit('getMagic', magic);
    Magics.push(String(magic));
    socket.magic = String(magic);
    for( var i = 0 ; i < Magics.length ; i ++ )
        console.log('magic[%d] = %s', i, Magics[i]);
    addWebOwnSocket(socket, String(magic));
  });

  
});

function addWebOwnSocket(socket, magic)   {
  //=====Web to Android
  socket.on('vibrate' + magic, function(msg){
     io.emit('connectOK'+magic, msg);
  });
  socket.on('ULT' + magic, function(msg){
     io.emit('connectOK'+magic, msg);
  });
  socket.on('vibrate1' + magic, function(msg){
     io.emit(player1uuid, msg);
  });
  socket.on('ULT1' + magic, function(msg){
     io.emit(player1uuid, msg);
  });
  socket.on('vibrate2' + magic, function(msg){
     io.emit(player2uuid, msg);
  });
  socket.on('ULT2' + magic, function(msg){
     io.emit(player2uuid, msg);
  });
  socket.on('data' + magic, function(data){
     SaveToDB(data);
  });
  //=====
}

function addMobileOwnSocket(socket, magic) {
  //=====Android to Web
  socket.on('message' + magic, function(msg){
    if(msg == 'fire'){
      io.emit('shoot' + magic, msg);
    }else if(msg == 'start'){
      io.emit('start' + magic, msg);
    }
  });
  socket.on('message1' + magic, function(msg){
    if(msg == 'fire'){
      io.emit('shoot1' + magic, msg);
    }else if(msg == 'start'){
      io.emit('start1' + magic, msg);
    }
  });
  socket.on('message2' + magic, function(msg){
    if(msg == 'fire'){
      io.emit('shoot2' + magic, msg);
    }else if(msg == 'start'){
      io.emit('start2' + magic, msg);
    }
  });
  socket.on('X' + magic, function(msg){
     io.emit('setX'+magic, msg);
  });
  socket.on('Y' + magic, function(msg){
     io.emit('setY'+magic, msg);
  });
  socket.on('X1' + magic, function(msg){
     io.emit('setX1' + magic, msg);
  });
  socket.on('Y1' + magic, function(msg){
     io.emit('setY1' + magic, msg);
  });
  socket.on('X2' + magic, function(msg){
     io.emit('setX2' + magic, msg);
  });
  socket.on('Y2' + magic, function(msg){
     io.emit('setY2' + magic, msg);
  });
  socket.on('ultra' + magic, function(msg){
     if(msg == 'start') io.emit('start'+magic, msg);
      else io.emit('ultra'+magic, msg);
  });
  socket.on('switch_weapon' + magic, function(msg){
     io.emit('switch_weapon'+magic, msg);
  });
  //=====
  //=====Android to server
  socket.on('requestPlayer'+magic, function(msg){
	var index = Magics.indexOf(String(magic))
	if( index > -1 ){
		player1status[index] = false;
		player2status[index] = false;
		player1uuid[index] = '';
		player2uuid[index] = '';
		
		if(msg == player1uuid[index] || msg == player2uuid[index]){return;}
		if(!player1status[index]){
			player1status[index] = true;
			player1uuid[index] = msg;
			io.emit(player1uuid[index], 'player1');
			//server to web
			io.emit('players' + magic, '2');
		}else if(!player2status[index]){
			player2status[index] = true;
			player2uuid[index] = msg;
			io.emit(player2uuid[index], 'player2');
			io.emit(player1uuid[index], 'ready');
			io.emit(player2uuid[index], 'ready');
			//server to web
			io.emit('players' + magic, 'go');
		}else{
			io.emit(msg, 'this room is full');
		}
	}
  });
  socket.on('stillConnect'+magic, function(msg){
	var index = Magics.indexOf(String(magic))
	if( index > -1 ){
		if(msg == player1uuid[index]){
			player1status[index] = true;
		}
		if(msg == player2uuid[index]){
			player2status[index] = true;
		}
	}
  });
  //=====
}

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *: %d', process.env.PORT);
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
  }, function(err) {
    if( err == null ) {
      // success
      // send scoreBoard string to web
      io.emit("scoreBoard", scoreBoard);
    }
  });
  console.log('int save to db');
}
