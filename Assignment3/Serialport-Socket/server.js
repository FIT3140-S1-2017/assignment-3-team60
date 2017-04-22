var express        = require('express');  
var app            = express();  
var httpServer = require("http").createServer(app);  
var io = require('socket.io')(httpServer);

app.get('/', function(req,res){

		//send the index.html file for all requests
		res.sendFile(__dirname + '/index.html');
	});

httpServer.listen(3000, function(){
		console.log('listening on http://localhost:3000');
	});

var connect = "Motion Connected";
var disconnect= "Motion Disconnected";

var SerialPort = require("serialport").SerialPort;
var serialport = new SerialPort("/dev/ttyACM0",{
    parser: SerialPort.parsers.readline('\n')
});
serialport.on('open', function(){
  console.log('Serial Port Opened');
  serialport.on('data', function(data){
      console.log(data);
      var starttime = new Date().getTime();
      io.sockets.emit('end:motion', {motionstatus:disconnect, timeStamp:starttime});
  });
});
