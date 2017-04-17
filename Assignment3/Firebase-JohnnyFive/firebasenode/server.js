var express        = require('express');  
var app            = express();  
var httpServer = require("http").createServer(app);  
var five = require("johnny-five");  
// var io = require('socket.io')(httpServer);
var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project1-cb101.firebaseio.com/"  // IMPORTANT: repalce the url with yours 
});

//Connect to arduino
var board = new five.Board();
var motion;

board.on('ready', function(){
	console.log('Arduino connected');
	motion = new five.Motion(2);
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var motiondb = db.ref("/Motion");
var motioncounter=0;
var once=0;

motiondb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	datamotion = snapshot.val();
	if (motioncounter === 0){
		motioncounter++
		if (datamotion !== 'null'){
			motiondb.update({type:'Disconnected',status: 'off',timestamp:0,ResponseMS:0});
		}else{
			motiondb.push({type:'Disconnected', status: 'off',timestamp:0,ResponseMS:0});
		}
	}else{
		if (snapshot.val().status =='on'){
			if (once===0){
				motion.on("motionstart", function(){
					console.log("Motion started");
					var Starttime = new Date();
					motiondb.push({type:'Connected', timestamp:Starttime.getTime(),ResponseMS:Starttime.getMilliseconds()});
					console.log("The timestamp is "	+ Starttime.getTime() + " milliseconds");
				});
			}
			if (once===0){
				once++;
				motion.on("motionend", function(){
					console.log("Motion end" +"\n");
					motiondb.({type:'Disconnected'});
				});
			}
		}
	}
});
				
