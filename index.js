var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*global.document = document;
global.Phaser = Phaser = require('Phaser/build/custom/phaser-arcade-physics');*/

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// add Mongo db
var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/User')

var highScore = require('./models/highScore.js');
var firebaseDB = require('./firebase.js');

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
  });
  socket.on('message', function(msg){
    //console.log('message: ' + msg);
	if(msg == 'fire'){
		io.emit('shoot', msg);
	}else if(msg == 'start'){
    console.log('start game');
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
	   if(msg == 'start')  {
       console.log('start game');
       io.emit('start', msg);
     }
	    else io.emit('ultra', msg);
  });
  socket.on('switch_weapon', function(msg){
	   io.emit('switch_weapon', msg);
  });
  socket.on('data', function(data)  {
    SaveToDB(data);
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

/*app.get('/user', function (req, res) {
  console.log(req.query);
  firebaseDB.updateScore({
    name: req.query.name,
    score: parseInt(req.query.score)
  });
  res.json({ message: 'success' });
}); */

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
