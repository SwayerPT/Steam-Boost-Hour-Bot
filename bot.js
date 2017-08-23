//Kenny's steam idle script
//Modified by Kingga
//Requires node.js, steam-user to work
//May also require steam-totp if running on windows
//Designed to work with the steam mobile authenticator

// TODO: EASY WAY TO ADD A GAME

//Main vars
var SteamUser = require('steam-user');
var SteamTotp = require('steam-totp');
var user = new SteamUser();

//Other Vars
var dt = new Date();
var utcDate = dt.toUTCString();
var timeStamp = Math.floor(Date.now() / 1000);
var afkMessage = "I am AFK right now, please leave a message";

var gameIDs = [440, 263060, 635880, 554530, 502140, 262280, 1900, 428430, 512640, 252150, 607270, 489520, 218620, 254040, 351030, 351030, 312960, 628760, 351940, 279720, 399430, 652550, 515690, 255520, 233130, 515690];

var idling = true;
var customIdleGameMessage = "Idling Games";

// Custom Commands
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', (line) => {
	if (line == "exit")
	{
		process.exit();
	}
	else if (line == "set afkmessage")
	{
		rl.question('What would you like the message to be?\n', (answer) => {
			afkMessage = answer;
			console.log("Your message has been set!");
		});
	}
	else if (line == "get afkmessage")
	{
		console.log("Your message is: " + afkMessage);
	}
	else if (line == "add gameid")
	{
		rl.question('What is the id of the game?\n', (answer) => {
			// Check if gameID < 32 items
			if (gameIDs.length < 30)
			{
				gameIDs.push(parseInt(answer));
				writeconfig();
				
				// Restart
				user.logOff();
				
				
				// NEED TO ADD A WAIT PERIOD
				
				
				
				
				login();
			}	
			else
				console.log("You cannot add anymore games to the list until you delete one");
		});
	}
	else if (line == "set customgamemsg")
	{
		rl.question('What would you like the game to be called?\n', (answer) => {
			customIdleGameMessage = answer;
			console.log("Your game name has been set!");
		});
	}
	else if (line == "get customgamemsg")
	{
		console.log("\nYour custom game is currently set to " + customIdleGameMessage + "\n");
	}
	else if (line == "add gameurl")
	{
		rl.question('What is the url of the game?\n', (answer) => {
			var tempArr = answer.split("/");
			
			// Check if gameID < 32 items
			if (gameIDs.length < 33)
			{
				gameIDs.push(parseInt(tempArr[2]));
				writeconfig();
				
				// Restart
				user.logOff();
				login();
			}	
			else
				console.log("You cannot add anymore games to the list until you delete one");
		});
	}
	else if (line == "delete gameid")
	{
		rl.question('What is the url of the game?\n', (answer) => {
			var index = gameIDs.indexOf(parseInt(answer));
			
			// Remove at index and shuffle everything back
			gameIDs.splice(index);
			
			writeconfig();
			
			// Restart
			user.logOff();
			login();
		});
	}
	else if (line == "delete gameurl")
	{
		rl.question('What is the url of the game?\n', (answer) => {
			var tempArr = answer.split("/");
			var index = gameIDs.indexOf(parseInt(tempArr[2]));
			
			// Remove at index and shuffle everything back
			gameIDs.splice(index);
			
			writeconfig();
			
			// Restart
			user.logOff();
			login();
		});
	}
	else if (line == "delete all")
	{
		gameIDs = [];
		
		writeconfig();
		
		// Restart
		user.logOff();
		login();
	}
	else if (line == "toggle afk")
	{
		if (afkToggle == 1)
	  {
		  console.log("AFK Chat Toggled Off");
		  afkToggle = 0;
	  }  
	  else if (afkToggle == 0)
	  {
		  console.log("AFK Chat Toggled On");
		  afkToggle = 1;
	  }
	}
	else if (line == "toggle idle")
	{
		if (idling)
		{
			idling = false;
			console.log("Idling Toggled Off");
			user.logOff();
		}
		else if (!idling)
		{
			idling = true;
			console.log("Idling Toggled On");
			login();
		}
	}
	else if (line == "count games")
	{
		console.log("\nLength: " + gameIDs.length - 1 + "\n");
	}
	else if (line == "list games")
	{
		var length = gameIDs.length;
		var gameName = "";
		
		console.log("\nGame IDs:\n");
		
		for (var i = 0; i < length; i++)
		{
			console.log(gameIDs[i]);
		}
	}
	else if (line == "writecfg")
	{
		writeconfig();
		
		// Restart
		user.logOff();
		login();
	}
	else if (line == "help")
	{
		console.log("\nCommands:\nset afkmessage\nget afkmessage\nset customgamemsg\nget customgamemsg\ntoggle afk\ntoggle idle\nadd gameid\nadd gameurl\ndelete gameid\ndelete gameurl\ndelete all\ncount games\nwritecfg\nlist games\n--------------------------------------------------\n");
	}
});

// Keypress toggle
var afkToggle = 1; // Currently AFK

var keypress = require('keypress');
 
 process.stdin.setRawMode(true);
 
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  if (key && key.name == "escape") {
	  if (afkToggle == 1)
	  {
		  console.log("AFK Chat Toggled Off");
		  afkToggle = 0;
	  }  
	  else if (afkToggle == 0)
	  {
		  console.log("AFK Chat Toggled On");
		  afkToggle = 1;
	  }
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();

var fs = require('fs');

var wstream;

//creates a log file with a unix timestamp for a name
if (!fs.existsSync("./AFKBotLogs/"))
{
	fs.mkdirSync("./AFKBotLogs/");
	wstream = fs.createWriteStream(process.cwd() + "\\AFKBotLogs\\" + timeStamp + '.log');
}
else
{
	wstream = fs.createWriteStream(process.cwd() + "\\AFKBotLogs\\" + timeStamp + '.log');
}


function readconfig()
{
	fs.readFile('afkbot_config.cfg', 'utf8', function (err, data) {
		if (err)
		{
			return console.log(err);
		}
		
		var lines = data.split(',');
		
		// Clear array
		gameIDs = [];
		
		for (var i = 0; i < lines.length; i++)
		{
			gameIDs.push(lines[i]);
		}
	});
}

function writeconfig()
{
	var wstreamcfg = fs.createWriteStream('afkbot_config.cfg');
	
	// write config
	var length = gameIDs.length;
	
	for (var i = 0; i < length; i++)
	{
		wstreamcfg.write(gameIDs[i] + ",");
	}
	
	return true;
}

//Function for Logon /////////////////////////////////////////////////////////////////////////////////////////
function login()
{
	if (idling)
	{
		user.logOn({
			accountName: "sn1p3r_123",
			password: "fofoca123456_1",
			twoFactorCode: SteamTotp.getAuthCode("RT2XT")
		});
	}
}

readconfig();

login();

//Function to set games and Online state
user.on('webSession', function(){
	console.log('Logged in!');
	//can be set to online or offline
	user.setPersona(SteamUser.Steam.EPersonaState.Online);
	
	if (idling)
	{
		// Add "Idling Games" to the end of list so steam will show "In non-Steam game Idling Games"
		var tempGameArr = gameIDs;
		tempGameArr.push("Idling Games");
		
		user.gamesPlayed(gameIDs);
	}
});

//Function to auto-reply to messages as well as log incoming mesages
user.on('friendMessage', function(steamID,message){
	if (afkToggle == 1)
	{
		var dt = new Date();
		var utcDate = dt.toUTCString();
		console.log(utcDate + " Friend message from " + steamID.getSteam3RenderedID() + ": " +  message);
		wstream.write('\n' + utcDate + " Friend message from " + steamID.getSteam3RenderedID() + ": " +  message);
		user.chatMessage(steamID, afkMessage);
		console.log("Message sent to " + steamID.getSteam3RenderedID());
	}
});

//version 2
