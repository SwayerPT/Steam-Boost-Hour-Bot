/*
    Community: Flow Community
    Community TeamSpeak: flowcm.ddns.net
    Created by Swayer
    
    version.1.0

*/

//var system
var Steam = require('steam-user'), fs = require('fs'), readlineSync = require('readline-sync');
var client = new Steam();
var settings = require('./config.json');
var mobileCode = readlineSync.question("[STEAM GUARD] Steam App Code: ");

var wstream;
var dtiming = new Date();
var tstamp = Math.floor(Date.now() / 1000);
var afk = "I'm out. Script created by Swayer";

// Looping function
var forallArray = function(array) {
  for (var i = array.Length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function log(message) {
	var date = new Date();
	var time = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
	
	for(var i = 1; i < 6; i++) {
		if(time[i] < 10) {
			time[i] = '0' + time[i];
		}
	}
	
	console.log(time[0] + '-' + time[1] + '-' + time[2] + ' ' + time[3] + ':' + time[4] + ':' + time[5] + ' - ' + message);
}


client.on("connected", function() {
  log("[STEAM] Initializing Servers.");
});



//login process
client.logOn({
  accountName: settings.username,
  password: settings.password,
  twoFactorCode: mobileCode  
});

client.on("loggedOn", function() {
  log("[STEAM] Initializing Steam Client..");
  client.setPersona(Steam.EPersonaState.Online);
  client.gamesPlayed(forallArray(settings.games));
  games(settings.games);     
});


//logs file

if (!fs.existsSync("./log/"))
{
	fs.mkdirSync("./log/");
	wstream = fs.createWriteStream(process.cwd() + "\\log\\" + tstamp + '.log');
}
else
{
	wstream = fs.createWriteStream(process.cwd() + "\\log\\" + tstamp + '.log');
}

//reply friends system
client.on('friendMessage', function(Steam,message){

		var dtiming = new Date();
		var utcDate = dtiming.toUTCString();
		log("[MESSAGE] New message: " + Steam.getSteam3RenderedID() + ": " +  message);
		wstream.write("[MESSAGE] New message: " + Steam.getSteam3RenderedID() + ": " +  message);
		client.chatMessage(Steam, afk);
		log("[MESSAGE] sent to " + Steam.getSteam3RenderedID());
});

//errors
client.on("error", function(err) {
  log(err);
});



//shutdown process
process.on('SIGINT', function() {
	log("[STEAM] Logging off...");
	shutdown();
});

function games() {
    
	if(settings.games.length < 30)
		{
            log("[STEAM] Initializing " + settings.games.length + " Games...");             
        
        } else {
            
            log("[STEAM] Exceeded the limit " + settings.games.length + " of 30 Games...");
	        log("[STEAM] Logging off...");           
			client.logOff();
	        shutdown();                   
        }    
}

function shutdown(code) {
	client.logOff();
	client.once('disconnected', function() {
		process.exit(code);
	});

	setTimeout(function() {
		process.exit(code);
	}, 500);
}