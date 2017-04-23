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
var led;
var motion;
board.on('ready', function(){
	console.log('Arduino connected');

	motion = new five.Motion(2);
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var sensordb = db.ref("/motionSensorData"); // channel name
var motiondb = db.ref("/Motion");



var total;				//total variable as status
var longmotion;				//longmotion variable as timestamp
var shortmotion;			//shortmotion variable as responsetime(server time)

sensordb.push({totaldata:"Disconnected", longdata:0, shortdata:0});
sensordb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	var datasensor = snapshot.val();         // How to retrive the new added object
	console.log(datasensor);
	if (datasensor === 'null'){
		sensordb.push({totaldata:"Disconnected", longdata:0, shortdata:0});
	}
}, function (errorObject) {             // if error
	console.log("The read failed: " + errorObject.code);
});

sensordb.on("child_added", function(snapshot){			// retrieve the newest data from firebase
	total = snapshot.val().totaldata;
	longmotion = snapshot.val().longdata;
	shortmotion = snapshot.val().shortdata;
	console.log("status: " + total);
	console.log("timestamp: " + longmotion);
	console.log("responsetime: " + shortmotion);
});



var motioncounter = 0;
motiondb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	datamotion = snapshot.val();
	console.log(datamotion);         // How to retrive the new added object
	if (motioncounter === 0){
		motioncounter++
		if (datamotion !== 'null'){
			motiondb.update({id:'motion', type:'OFF'});
		}else{
			motiondb.push({id:'motion', type:'OFF'});
		}
	}else{
		var motiontype = snapshot.val().type;			//if type of motion is on, motion sensor will be on
		if (motiontype === 'ON'){
			motion.on("motionstart", function() {
				console.log("Motion start");
				sensordb.push({totaldata:"Connected", longdata:0, shortdata:0});
				
			});
			
			motion.on("motionend", function() {
				console.log("Motion end");
				longmotion = new Date().getTime();
				sensordb.push({totaldata:"Disconnected", longdata:longmotion, shortdata:0});
				
			});
		}
	}
}, function (errorObject) {             // if error
  console.log("The read failed: " + errorObject.code);
});
