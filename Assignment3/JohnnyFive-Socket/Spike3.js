var express        = require('express');  
var app            = express();  
var httpServer = require("http").createServer(app);  
var five = require("johnny-five");  
var io = require('socket.io')(httpServer);

app.get('/', function(req,res){

		//send the index.html file for all requests
		res.sendFile(__dirname + '/Spike3.html');
	});

httpServer.listen(3000, function(){

		console.log('listening on http://localhost:3000');
	});
var board = new five.Board();
var motion;
board.on('ready', function(){
		console.log('Arduino connected');
		motion = new five.Motion(2);
	});
var connect = "Motion Connected";
var disconnect= "Motion Disconnected";
io.on('connection', function(socket){
		socket.on('sensor:on', function(data){
			motion.on("motionstart", function() {
				console.log("Motion started");
				socket.emit('start:motion', {motionstatus:connect});
			});
			motion.on("motionend", function() {
				console.log("Motion end" +"\n");
				var starttime = new Date().getTime();
				console.log("The timestamp is "	+ starttime + " milliseconds");
				socket.emit('end:motion', {motionstatus:disconnect, timeStamp:starttime});
			});
		});
	});


		
