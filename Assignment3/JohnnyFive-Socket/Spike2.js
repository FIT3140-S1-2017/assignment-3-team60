var express        = require('express');  
var app            = express();  
var httpServer = require("http").createServer(app);  
var five = require("johnny-five");  
var io = require('socket.io')(httpServer);

app.get('/', function(req,res){

		//send the index.html file for all requests
		res.sendFile(__dirname + '/Spike2.html');
	});

httpServer.listen(3000, function(){

		console.log('listening on http://localhost:3000');
	});

//Connect to arduino
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
				var Starttime = new Date();
				console.log("Motion started");
				console.log("The timestamp is "	+ Starttime.getTime() + " milliseconds");
				socket.emit('start:motion', {motionstatus: connect,TimeStamp: Starttime.getTime()});
			});
			motion.on("motionend", function() {
				console.log("Motion end" +"\n");
				socket.emit('end:motion', {motionstatus: disconnect});

			});
		});
	});


		
