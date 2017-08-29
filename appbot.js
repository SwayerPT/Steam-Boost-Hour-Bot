/*
    Project: Steam Hour Bot
    Flow Community TeamSpeak: flowcm.ddns.net
    Created by Swayer
    
    version.1.3.5
*/

//===============//===============Variables process//
const Steam = require('steam-user'), 
      fs = require('fs'), 
      readlineSync = require('readline-sync'), 
      chalk = require('chalk'),
      SteamCommunity = require('steamcommunity');
const client = new Steam();
const settings = require('./config.json');

//This fiels are empty, there is no logs or something else to steal your details. Only entered in the CMD.
//if u close "//" username & password, you can add into config.json both to REMEMBER, otherwise.. insert all the time.
console.log(chalk.black.bold.bgWhite('    Steam Account        '));
var username = readlineSync.question(chalk.gray.underline(' Username ') + ': ');
var password = readlineSync.question(chalk.gray.underline(' Password ') + ': ', {hideEchoBack: true});
var mobileCode = readlineSync.question(chalk.gray.underline(' Steam Auth Code ') + ': ');

var wstream;
var dtiming = new Date();
var tstamp = Math.floor(Date.now() / 1000);


/*============================================CONTENT=========================================*/

var forallArray = function(array) {
  for (var i = array.Length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//===============//===============login process//

client.logOn({
  accountName: username,
  password: password,
  twoFactorCode: mobileCode  
});

client.on("loggedOn", function() {
  client.setPersona(Steam.EPersonaState.Away);
  log(`Logged on Steam Client as ${client.steamID.getSteam3RenderedID()}`);
  client.gamesPlayed(forallArray(settings.games));
});

//===============//===============server process//
if (fs.existsSync('servers')) {
      Steam.servers = JSON.parse(fs.readFileSync('servers'));
      log("Connecting to the Servers.");    
    }

    client.on("connected", function() {
      log("Initializing Servers.");
});

//

//===============//===============limitation process//

client.on('accountLimitations', function (limited, communityBanned) {
    if (limited) {  
        if(settings.games.length < 5)
            {
                log("This Account is Limited.");
                log("Initializing " + settings.games.length + " of 5 games...");            

            } else {
                
                    log("Exceeded the limit " + settings.games.length + " of 5 Games.");
                    log("Logging off...");           
                    client.logOff();
                    shutdown(); 
            }      
        } 
         else if(settings.games.length < 30)
        {
            
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

//===============//===============friendrequest process//

client.on('friendRelationship', (steamID, relationship) => {
	if (relationship === 2 && settings.acceptRandomFriendRequests) {
        
	client.addFriend(steamID);
        //client.removeFriend(steamID);  
        client.sendMessage(steamID, "Thank you for Added me. We talk later.");        
        log(chalk.yellow('You have an invite from '+steamID+'.'));        
	}
});

//===============//===============New items//

client.on('newItems', function (count) {
    log(chalk.green("You received "+ count + " new items in our Inventory."));
});

//===============//===============Trade Offers process//


client.on('tradeOffers', function (number, steamID) {
    if (number > 0) {
        log(chalk.green("You received "+ number +" Trade Offer from "+steamID+"."));     
    }
});

//===============//===============reply process//
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


//===============//===============errors process//

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


//===============//===============shutdown process//

process.on('SIGINT', function() {
	log("Logging off...");
	shutdown();
});


/*============================================FUNCTIONS=========================================*/

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

function games() {
    
	if(settings.games.length < 30)
		{
            log("Initializing " + settings.games.length + " Games...");             
        
        } else {
            
            log("Exceeded the limit " + settings.games.length + " of 30 Games...");
	        log("Logging off...");           
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
