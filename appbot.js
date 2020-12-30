/*
    Project: Steam Hour Bot
    Created by Swayer
    version.1.3.7 (no longer in development).
*/

//=============== CONSTRUTORS  ===============//

const Steam = require('steam-user'), 
      fs = require('fs'), 
      readlineSync = require('readline-sync'), 
      chalk = require('chalk'),
      SteamCommunity = require('steamcommunity');
const client = new Steam();
//const settings = require('./config.json');
const settings = {
  //"username": "STEAMUSER",
  //"password": "STEAMPW",
  "acceptRandomFriendRequests": false,  
  "games": [730]
}

//=============== VARIABLES  ===============//

console.log(chalk.black.bold.bgWhite('    Steam Account        '));

//Hide Username and Password by "//" and Open on Config, if you prefer to use in the CONFIG file.
var username = readlineSync.question(chalk.gray.underline(' Username ') + ': ');
var password = readlineSync.question(chalk.gray.underline(' Password ') + ': ', {hideEchoBack: true});

var mobileCode = readlineSync.question(chalk.gray.underline(' Steam Auth Code ') + ': ');

var wstream;
var dtiming = new Date();
var tstamp = Math.floor(Date.now() / 1000);


//=============== CHECK GAME CODES FROM CONFIG  ===============//

var forallArray = function(array) {
  for (var i = array.Length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//=============== START SESSION  ===============//

client.logOn({
  accountName: username,
  password: password,
  twoFactorCode: mobileCode  
});

client.on("loggedOn", function() {
  client.setPersona(Steam.EPersonaState.Away);
    if (username === "" || password === "") {
        log("Login Denied - Empty fields.");
        shutdown();        
    } else {
        log(`Logged on Steam Client as ${client.steamID.getSteam3RenderedID()}`);
        client.gamesPlayed(forallArray(settings.games));        
    }   
});

//=============== CHECK SERVER AVAILABILITY  ===============//

if (fs.existsSync('servers')) {
    Steam.servers = JSON.parse(fs.readFileSync('servers'));
    log("Connecting...");    
}

client.on("connected", function() {
    log("Initializing...");
});

//

//=============== LIMITATIONS (PREVENT LIMITED ACCOUNTS WITH ONLY 5 GAMES)  ===============//

client.on('accountLimitations', function (limited, communityBanned) {
    if (limited) {  
        if(settings.games.length < 5) {
                log("This Account is Limited.");
                log("Initializing " + settings.games.length + " of 5 games...");            
            } else {
                log("Exceeded the limit " + settings.games.length + " of 5 Games.");
                log("Logging off...");           
                client.logOff();
                shutdown(); 
            }      
        } else if(settings.games.length < 30) {
            log("Initializing " + settings.games.length + " of 30 games...");             
        } else {
            log("Exceeded the limit " + settings.games.length + " of 30 Games.");
	        log("Logging off...");           
			client.logOff();
	        shutdown();                   
        }     
    if (communityBanned){
        log("Your account is Banned from Steam Community.");
        log("Logging off...");           
        client.logOff();
        shutdown();          
    }
});

//=============== REQUESTS  ===============//

client.on('friendRelationship', (steamID, relationship) => {
	if (relationship === 2 && settings.acceptRandomFriendRequests) {
	  client.addFriend(steamID);
        //client.removeFriend(steamID);  
      client.chatMessage(steamID, "Thank you for Added me. We talk later.");        
      log(chalk.yellow('You have an invite from '+steamID+'.'));        
	}
});

//=============== ITEMS NOTIFY  ===============//

client.on('newItems', function (count) {
    log(chalk.green("You received "+ count + " new items in our Inventory."));
});

//=============== TRADES NOTIFY  ===============//

client.on('tradeOffers', function (number, steamID) {
    if (number > 0) {
        log(chalk.green("You received "+ number +" Trade Offer from "+steamID+"."));     
    }
});


//=============== AUTO REPLY  ===============//

client.on("friendMessage", function(steamID, message) {
    if (message == "hello") {
        client.chatMessage(steamID, "Hi! I'm here at the moment...");
    }
    if (message == "play") {
        client.chatMessage(steamID, "Hey! Can we play later?");
    }  
    if (message == "yes") {
        client.chatMessage(steamID, "Thank you! See you soon.");
    } 	
});


//=============== ERROR SYS  ===============//

client.on("error", function(err) {
  //log("[STEAM] Login Failed on Client.");    
  //log(err);
    
    if (err.eresult == Steam.EResult.InvalidPassword)
    {
        log("Login Failed, Password.");
        shutdown();
    }
    else if (err.eresult == Steam.EResult.AlreadyLoggedInElsewhere)
    {
        log("Already logged in!");
        shutdown();
    }
    else if (err.eresult == Steam.EResult.AccountLogonDenied)
    {
        log("Login Denied - SteamGuard required");
        shutdown();
    }
    
});


//=============== SHUT DOWN SYS  ===============//

process.on('SIGINT', function() {
	log("Logging off...");
	shutdown();
});


//=============== STATUS ON CONSOLE  ===============//

console.log(chalk.black.bold.bgWhite('    Connection Status    '));
function log(message) {
	var date = new Date();
	var time = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
	
	for(var i = 1; i < 6; i++) {
		if(time[i] < 10) {
			time[i] = '0' + time[i];
		}
	}
	console.log(' ' + time[3] + ':' + time[4] + ':' + time[5] + ' - \x1b[36m%s\x1b[0m', '[STEAM] ' + message);
}

//=============== GAME CALCS ===============//

function games() {
	if(settings.games.length < 30) {
      log("Initializing " + settings.games.length + " Games...");               
    } else {
            
      log("Exceeded the limit " + settings.games.length + " of 30 Games...");
	  log("Logging off...");           
      client.logOff();
	  shutdown();                   
   }    
}

//=============== SHUTDOWN FUNCS  ===============//

function shutdown(code) {
	client.logOff();
	client.once('disconnected', function() {
		process.exit(code);
	});

	setTimeout(function() {
		process.exit(code);
	}, 500);
}
