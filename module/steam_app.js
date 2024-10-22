/*
    Project: Steam Hour Bot - NodeJS
    Note: By using this bot I will not be responsible if you edit the code for bad purposes.
    
    Created by SwayerPT with Love.
    Donate your candie and help to improve with new projects.
    https://steamcommunity.com/id/swayerpt/
*/

// construtors
const SteamUserReserved = require("steam-user");
const fs = require("fs");
const path = require('path');
const readlineSync = require("readline-sync");
//const readline = require('readline');
const SteamCommunity = require("steamcommunity");
const axios = require("axios"); 
const crypto = require('crypto');
const natural = require('natural'); // New dependency
const stringSimilarity = require('string-similarity'); // New dependency
const moment = require('moment'); // New dependency
const notifier = require('node-notifier'); // For desktop notifications

//design struture
const chalk = require('chalk');

// Initialize Steam client and other necessary variables
const client = new SteamUserReserved();
const settings = {
    appearOnline: false, // change to true or false, on or off.
    acceptRandomFriendRequests: true, // change to true or false, on or off.
    acceptItemNotify: true, // change to true or false, on or off.
    acceptTradesNotify: true, // change to true or false, on or off.
    acceptReplys: true, // change to true or false, on or off.
    limits: 25, // no need to change
    restriction: 5, // no need to change
    games_id: [], // no need to change
    proceedWithBannedAccount: false, //to proceed with bans
    playSoundOnNewItem: true, //turn sound on
    version: 'v1.5.9'
};

/**********************************************************************************************
    WELCOME
***********************************************************************************************/

    function printHeader() {
        // Create a header banner using chalk styles
        const headerText = `
    ${chalk.blue.bold('  ███████╗████████╗███████╗ █████╗ ███╗   ███╗ ')}
    ${chalk.blue.bold('  ██╔════╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║ ')}
    ${chalk.blue.bold('  ███████╗   ██║   █████╗  ███████║██╔████╔██║ ')}
    ${chalk.blue.bold('  ╚════██║   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║ ')}
    ${chalk.blue.bold('  ███████║   ██║   ███████╗██║  ██║██║ ╚═╝ ██║ ')}
    ${chalk.blue.bold('  ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ')}

    ${chalk.blue.bold('  Steam Hour Bot - Developed by SwayerPT')}
    `;

    // Display the header
        console.log(headerText);
        console.log(chalk.black.bold.bgWhite("    Inicialization    "));
        //load(chalk.yellow.bold('Loading Modules...'));
    }


    //console.log(chalk.white.bold.bgBlack("    Developed by: SwayerPT     "));
    //console.log(chalk.white.bold.bgBlack("    Steam-Boost-Hour [Bot]     "));
    console.log(chalk.gray.underline("                   " + settings.version));
    //console.log(chalk.black.bold.bgWhite("      Steam Login        "));        

/**********************************************************************************************
    LOGS FUNCTIONS
***********************************************************************************************/

    // Function to shuffle and count games
    function CountGamesUsed(gamesArray) {
        for (let i = gamesArray.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [gamesArray[i], gamesArray[j]] = [gamesArray[j], gamesArray[i]];
        }
        return gamesArray;
    }

    // Function to parse the input of gamesid and ensure it's an array of integers
    function parseInput(input) {
        return input.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    }

    // Configuration object
    const config = {
        logDir: path.join(__dirname, 'logs'),
        logFileName: 'logs.txt',
        maxLogFileSize: 5 * 1024 * 1024, // 5 MB
        logLevels: ['STEAM', 'ERROR', 'BOT', 'TIP', 'INFO', 'LOAD', 'LEARN'], // Log levels to be recorded
    };

    // Ensure log directory exists
    if (!fs.existsSync(config.logDir)) {
        fs.mkdirSync(config.logDir, { recursive: true });
    }

    // Function to rotate logs
    function rotateLogs() {
        const logFilePath = path.join(config.logDir, config.logFileName);

        if (fs.existsSync(logFilePath)) {
            const stats = fs.statSync(logFilePath);
            if (stats.size >= config.maxLogFileSize) {
                const timestamp = new Date().toISOString().replace(/:/g, '-');
                const newLogFileName = `logs_${timestamp}.txt`;
                const newLogFilePath = path.join(config.logDir, newLogFileName);
                fs.renameSync(logFilePath, newLogFilePath);
            }
        }
    }

    // Function to log messages to a file asynchronously
    function logToFile(message, type = 'INFO') {
        // Check if the current log level should be logged
        if (!config.logLevels.includes(type)) return;

        const timestamp = new Date().toLocaleTimeString();
        if (type === 'TIP') {
            logMessage = `[${type}] ${message}\n`; // Assign value if type is TIP
        } else {
            logMessage = `${timestamp} - [${type}] ${message}\n`; // Assign value for other types
        }
        const logFilePath = path.join(config.logDir, config.logFileName);

        // Rotate logs if needed
        rotateLogs();

        // Write the log message asynchronously
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) error(chalk.red(`Failed to write log: ${err.message}`)); 
        });

        // Still log to the console
        console.log(logMessage);
    }

    // Error codes to use on CMD and txt file.
    function log(message) {
        logToFile(message, 'STEAM');
    }

    function error(message) {
        logToFile(message, 'ERROR');
    }

    function boterr(message) {
        logToFile(message, 'BOT');
    }

    function tips(message) {
        logToFile(message, 'TIP');
    }    
    function load(message) {
        logToFile(message, 'LOAD');
    }

    function learn(message) {
        logToFile(message, 'LEARN');
    }
    // Example usage of configurable log levels
    // config.logLevels = ['ERROR', 'BOT']; // Only log errors and bot messages in production

    module.exports = { log, error, boterr, tips, load, learn, config };

/**********************************************************************************************
    UTILITY2 FUNCTIONS
***********************************************************************************************/

    function encrypt(text, password) {
        const iv = crypto.randomBytes(16); // Initialization vector
        const key = crypto.createHash('sha256').update(password).digest(); // Create a 256-bit key

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Combine iv and encrypted text for storage
        return iv.toString('hex') + ':' + encrypted;
    }

    function decrypt(encryptedData, password) {
        encryptedData = String(encryptedData); 
    
        if (!encryptedData || typeof encryptedData !== 'string' || !encryptedData.includes(':')) {
            throw new Error('Invalid encrypted data format.');
        }
        const [ivHex, encryptedText] = encryptedData.split(':');
        if (!ivHex || !encryptedText) {
            throw new Error('Invalid encrypted data components.');
        }
        const iv = Buffer.from(ivHex, 'hex');
        if (iv.length !== 16) {
            throw new Error('Invalid IV length. Expected 16 bytes.');
        }
        const key = crypto.createHash('sha256').update(password).digest();
    
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
    
        return decrypted;
    }
    

    // Function for shutting down the bot
    async function shutdown(signalOrCode = 0) {
        const exitCode = typeof signalOrCode === 'number' ? signalOrCode : 0;

        settings.games_id.forEach(gameId => stopGameTracking(gameId)); // Stop tracking playtime

        // Ensure final playtimes are shown
        await AppGameIDPlayTime(); 

        log(chalk.yellow("Disconnecting..."));
        client.logOff();

        // Allow time for logOff to complete and for playtime to be logged
        client.once("disconnected", () => process.exit(exitCode));
        setTimeout(() => process.exit(exitCode), 500);
    }
    
    //get game id -> name
    async function AppNameID(appId) {
      try {
        const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
        const data = response.data;

        if (data[appId] && data[appId].success) {
          return data[appId].data.name;
        } else {
          error(chalk.red(`Game not found on ID ${appId}`));    
          return null;
        }
      } catch (error) {
        error(chalk.red(`Fetching game information for appId: ${appId} - ${error.message}`));
        return null
      }
    }

    // Function to format time from seconds to HH:MM:SS
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

/**********************************************************************************************
    GAME TRACKING AND PLAYTIME LOGGING
***********************************************************************************************/

const playTimes = {};
let startTime = Date.now(); // Track when the bot started

    // Function to display playtimes
    async function AppGameIDPlayTime() {
        const now = Date.now();
        
        if (loadedCredentials) {
            settings.games_id = loadedCredentials.gamesid.split(',').map(gameId => gameId.trim()); // Split into array
        }           
        
        for (const gameId of settings.games_id) {
            
            // Check if gameId is null or undefined
            if (!gameId) {
                log(chalk.red(`[${gameId}] Invalid`));
                continue; // Skip to the next gameId in the loop
            } else 
            if (!playTimes[gameId]) {
                playTimes[gameId] = { start: null, total: 0 };
            }

            const playTime = playTimes[gameId];
            if (playTime.start) {
                playTime.total += (now - playTime.start) / 1000;
                playTime.start = now; // Reset start time for the next interval
            }

            const gameName = await AppNameID(gameId);
            log(chalk.yellow(`[${gameId}][${gameName}] playing time: ${formatTime(playTime.total)}`));
        }
    }

    // Start tracking when a game begins
    function startGameTracking(gameId) {
        if (!playTimes[gameId]) {
            playTimes[gameId] = { start: Date.now(), total: 0 };
        } else {
            playTimes[gameId].start = Date.now(); // Update start time if already tracking
        }
    }

    // Stop tracking when a game stops
    function stopGameTracking(gameId) {
        if (playTimes[gameId] && playTimes[gameId].start) {
            const now = Date.now();
            playTimes[gameId].total += (now - playTimes[gameId].start) / 1000;
            playTimes[gameId].start = null; // Stop tracking
        }
    }

// Periodically display playtimes every hour
setInterval(AppGameIDPlayTime, 3600000);

/**********************************************************************************************
    LOGIN SYSTEM
***********************************************************************************************/

// Function to get input from user
function getInput() {
    printHeader();
    tips(chalk.yellow("Choose the games by adding the codes like: 730, 440..."));

    let gamesid = readlineSync.question(chalk.gray.bold(" GameID") + ": ");
    let username = readlineSync.question(chalk.gray.bold(" Username ") + ": ");
    let password = readlineSync.question(chalk.gray.bold(" Password ") + ": ", { hideEchoBack: true });
    let hasTwoFactorCode = readlineSync.keyInYNStrict(chalk.gray.bold(" Do you have SteamGuard? "));
    let appearOnline = readlineSync.keyInYNStrict(chalk.gray.bold(" Do you want to appear ONLINE? "));

    // Ask the user if they want to encrypt their credentials
    let encryptCredentials = readlineSync.keyInYNStrict(chalk.yellow(" Do you want to encrypt your credentials? (Recommended) "));

    let masterPassword = null;

    if (encryptCredentials) {
        // Ask for master password to encrypt credentials
        masterPassword = readlineSync.question(chalk.gray.bold(" Enter a master password to encrypt your credentials ") + ": ", { hideEchoBack: true });
    } else {
        // Display warning about storing credentials in plaintext
        console.warn(chalk.red.bold("Warning: Storing credentials in plaintext is insecure and not recommended."));
    }

    // Save credentials to file
    saveCredentials({ gamesid, username, password, hasTwoFactorCode, appearOnline }, encryptCredentials, masterPassword);

    // Reload credentials from file to ensure consistency
    return loadCredentials(masterPassword);
}

// Function to save credentials to a file
function saveCredentials(credentials, encryptCredentials, masterPassword) {
    let storedCredentials = {
        gamesid: credentials.gamesid,
        hasTwoFactorCode: credentials.hasTwoFactorCode,
        appearOnline: credentials.appearOnline,
        encryptCredentials: encryptCredentials // Store this flag to know how to handle decryption
    };

    if (encryptCredentials) {
        // Encrypt username and password
        const encryptedUsername = encrypt(credentials.username, masterPassword);
        const encryptedPassword = encrypt(credentials.password, masterPassword);

        // Ensure encrypted data is stored as strings
        storedCredentials.username = String(encryptedUsername);
        storedCredentials.password = String(encryptedPassword);
    } else {
        // Store credentials in plaintext (Not recommended)
        storedCredentials.username = String(credentials.username);
        storedCredentials.password = String(credentials.password);
    }

    const filePath = path.join(__dirname, 'credentials.txt');
    fs.writeFileSync(filePath, JSON.stringify(storedCredentials, null, 2), { flag: 'w' });
}

// Function to load and decrypt credentials from a file
function loadCredentials(providedMasterPassword = null) {
    const filePath = path.join(__dirname, 'credentials.txt');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const storedCredentials = JSON.parse(data);

        if (storedCredentials.encryptCredentials) {
            let attempts = 0;
            const maxAttempts = 3;
            let masterPassword = providedMasterPassword;

            while (attempts < maxAttempts) {
                if (!masterPassword) {
                    masterPassword = readlineSync.question(chalk.gray.bold(" Enter your master password to decrypt your credentials ") + ": ", { hideEchoBack: true });
                }

                try {
                    // Attempt to decrypt
                    const decryptedUsername = decrypt(storedCredentials.username, masterPassword);
                    const decryptedPassword = decrypt(storedCredentials.password, masterPassword);

                    // Store decrypted credentials and masterPassword
                    return {
                        gamesid: storedCredentials.gamesid,
                        username: decryptedUsername,
                        password: decryptedPassword,
                        hasTwoFactorCode: storedCredentials.hasTwoFactorCode,
                        appearOnline: storedCredentials.appearOnline,
                        masterPassword, // Save for later use
                        encryptCredentials: true
                    };
                } catch (error) {
                    console.error(chalk.red("Failed to decrypt credentials. Please check your master password."));
                    attempts++;
                    masterPassword = null; // Reset to prompt again
                }
            }
            console.error(chalk.red("Maximum decryption attempts exceeded."));
            return null; // Indicate failure to load credentials
        } else {
            // Credentials are stored in plaintext
            console.warn(chalk.red.bold("Warning: Your credentials are stored in plaintext. It is strongly recommended to encrypt them."));
            return {
                gamesid: storedCredentials.gamesid,
                username: storedCredentials.username,
                password: storedCredentials.password,
                hasTwoFactorCode: storedCredentials.hasTwoFactorCode,
                appearOnline: storedCredentials.appearOnline,
                encryptCredentials: false
            };
        }
    }
    return null; // No credentials found
}

// Load credentials at the start of the application
let loadedCredentials = loadCredentials();

if (loadedCredentials) {
    printHeader();
    log(chalk.green("OneTime Login [" + loadedCredentials.username + "] started successfully."));

    // Update settings based on loaded credentials
    settings.appearOnline = loadedCredentials.appearOnline;
    settings.games_id = loadedCredentials.gamesid.split(',').map(gameId => gameId.trim());
} else {
    loadedCredentials = getInput();
    settings.appearOnline = loadedCredentials.appearOnline;
    settings.games_id = loadedCredentials.gamesid.split(',').map(gameId => gameId.trim());
}

// Log in to Steam
async function login() {
    let retries = 0;
    const maxRetries = 3;
    const delayBetweenRetries = 3000; // milliseconds

    while (retries < maxRetries) {
        try {
            await new Promise((resolve, reject) => {
                const onLoggedOn = () => {
                    client.removeListener('error', onError);
                    resolve();
                };
                const onError = (err) => {
                    client.removeListener('loggedOn', onLoggedOn);
                    reject(err);
                };

                client.once('loggedOn', onLoggedOn);
                client.once('error', onError);

                if (loadedCredentials.hasTwoFactorCode) {
                    const mobileCode = readlineSync.question(chalk.gray.bold(" SteamGuard Code ") + ": ", { hideEchoBack: true });
                    client.logOn({
                        accountName: loadedCredentials.username,
                        password: loadedCredentials.password,
                        twoFactorCode: mobileCode
                    });
                } else {
                    client.logOn({
                        accountName: loadedCredentials.username,
                        password: loadedCredentials.password
                    });
                }
            });
            // If logged on successfully, break the loop
            break;
        } catch (e) {
            retries++;
            if (retries < maxRetries) {
                error(chalk.red(`Login attempt ${retries} failed: ${e.message}. Retrying...`));
                await new Promise(res => setTimeout(res, delayBetweenRetries)); // Wait before retrying
            } else {
                error(chalk.red(`Maximum login retries exceeded.`));
                shutdown();
            }
        }
    }
}
login();

/**********************************************************************************************
    LOGGED SYSTEM
***********************************************************************************************/

client.on("loggedOn", () => {

    const { username, password, appearOnline, gamesid } = loadedCredentials;
    
    if (loadedCredentials) {
        settings.games_id = loadedCredentials.gamesid.split(',').map(gameId => gameId.trim()); // Split into array
    }   
    
    //set friendchat mode.
    if (settings.appearOnline) {
        console.log(chalk.black.bold.bgWhite("    Online Mode    "));
        client.setPersona(SteamUserReserved.EPersonaState.Online); // Set to ONLINE
        log(chalk.red("Set Online."));
    } else {
        console.log(chalk.black.bold.bgWhite("    Online Mode    "));
        client.setPersona(SteamUserReserved.EPersonaState.Invisible); // Set to INVISIBLE
        log(chalk.red("Set Invisible."));
    }
    
    //checks login issues during connection
    if (username === "" || password === "") {
        console.log(chalk.black.bold.bgWhite("    Connection Status    "));
        log(chalk.red("Login Denied - Empty fields."));
        shutdown();
    } else {
        console.log(chalk.black.bold.bgWhite("    Connection Status    "));
        client.on("accountInfo", (name) => {
            log(chalk.green("Logged in as " + name + "."));
            client.on("vacBans", (bans, games) => {
                if (bans > 0) {
                    log(chalk.red("Verified (" + bans + ") ban" + (bans === 1 ? "" : "s") + (games.length === 0 ? "" : " in " + games.join(", ")) + "."));

                    // Ask the user if they want to proceed with the banned account
                    let proceed = readlineSync.keyInYNStrict(chalk.red("Do you still want to proceed with VAC? ") + ": ");
                    settings.proceedWithBannedAccount = proceed;

                    if (!settings.proceedWithBannedAccount) {
                        log(chalk.red("Bot not able to proceed with banned games."));
                        shutdown();
                    }
                }
            });
        });
        tips(chalk.yellow("Use (CTRL + C) to Logout."));
        client.gamesPlayed(CountGamesUsed(settings.games_id));
        settings.games_id.forEach(gameId => startGameTracking(gameId));
    }
});

if (fs.existsSync("servers")) {
    SteamUserReserved.servers = JSON.parse(fs.readFileSync("servers"));
    log(chalk.green("Connecting to server ..."));
}

client.on("connected", () => {
    log(chalk.green("Starting Bot..."));
});

client.on("accountLimitations", async (limited, communityBanned, locked, canInviteFriends) => {
    console.log(chalk.black.bold.bgWhite("      Initializing       "));
    if (canInviteFriends) {
        log(chalk.green("Checking Invite Friends ..."));
    } else {
        log(chalk.red("[Invite] canInviteFriends Banned."));
    }

    if (communityBanned) {
        log(chalk.red("[Community] Community Banned."));
    } else {
        log(chalk.green("Checking Community ..."));
    }

    if (locked) {
        log(chalk.red("[Account] Locked Account."));
    } else {
        log(chalk.green("Checking Account ..."));
    }

    log(chalk.green("Initializing ..."));

    // Ensure this is inside an async function
    try {
        const gameNames = await Promise.all(settings.games_id.map(gameId => AppNameID(gameId)));

        if (limited) {
            if (settings.games_id.length < settings.restriction) {
                log(chalk.blue("This Account is Limited."));
                log(chalk.green("[Limited] Currently In-Game: " + gameNames.join(", ") + "."));
            } else {
                error(chalk.red("Exceeded the limit of 5 Games..."));
                shutdown();
            }
        } else {
            if (settings.games_id.length < settings.limits) {
                log(chalk.green("Currently In-Game: " + gameNames.join(", ") + "."));
            } else {
                error(chalk.red("Exceeded the limit of 25 Games."));
                shutdown();
            }
        }
    } catch (err) {
        error(chalk.red("Failed to fetch game names: " + err.message));
        shutdown();
    }
});

/**********************************************************************************************
    EVENTS HANDLERS
***********************************************************************************************/

client.on("friendRelationship", (steamID, relationship) => {
    if (relationship === 2 && settings.acceptRandomFriendRequests) {
        client.addFriend(steamID);
        log(chalk.yellow(`You have a new friend request from ${steamID}.`));
    } else if (relationship === 2) {
        error(chalk.red(`Friend request from ${steamID} was ignored due to settings.`));
    } else {
        error(chalk.red(`No friend request found. Current relationship: ${relationship}.`));
    }
});

client.on("newItems", (count) => {
    // Get current timestamp
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // Validate item count
    if (typeof count !== 'number' || count < 0) {
        return error(chalk.red(`[${timestamp}] Invalid item count: ${count}.`));
    }

    // New items received
    if (settings.acceptItemNotify && count > 0) {
        const itemText = count === 1 ? "item" : "items";
        log(chalk.yellow(`[${timestamp}] You received ${count} new ${itemText} in your Inventory.`));
        
        // Optional: Play a sound or desktop notification
        if (settings.playSoundOnNewItem) {
            notifier.notify({
                title: 'Steam Inventory Alert',
                message: `You received ${count} new ${itemText}.`,
                sound: true
            });
        }

    // No new items received
    } else if (count === 0) {
        log(chalk.blue(`[${timestamp}] No new items received.`));

    // Suppressed notification or invalid count
    } else {
        error(chalk.red(`[${timestamp}] Item notification suppressed or invalid count (${count}).`));
    }
});

client.on("tradeOffers", (count, steamID) => {
    if (settings.acceptTradesNotify && count > 0) {
        log(chalk.yellow(`You received ${count} new Trade Offer(s) from ${steamID}.`));
    } else if (count === 0) {
        log(chalk.blue("No new trade offers received."));
    } else {
        error(chalk.red(`Unable to process trade offer notification. Count: ${count}, SteamID: ${steamID}.`));
    }
});

/**********************************************************************************************
    FRIEND MESSAGES - FUNCTIONS TO READ RESPONSES FROM FILE
***********************************************************************************************/
// Function to load replies from the memory.txt file
function loadReplies() {
    const filePath = path.join(__dirname, 'memory.txt');
    const replies = {};

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        
        lines.forEach(line => {
            const [key, value] = line.split(':');
            if (key && value) {
                replies[key.trim().toLowerCase()] = value.trim();
            }
        });
    } else {
        // Create an empty memory.txt file
        fs.writeFileSync(filePath, '', { flag: 'w' });
        console.log(chalk.yellow("Created a new memory.txt file."));
    }

    return replies;
}

// Load responses on bot startup
let replies = loadReplies();

client.on("friendMessage", (steamID, message) => {
    log(chalk.yellow(`Received a message from ${steamID.getSteam3RenderedID()} saying: ${message}`));

    if (settings.acceptReplys) {
        const receivedMessage = message.toLowerCase().trim();

        // Fuzzy match to find the best response
        const bestMatch = getBestMatch(receivedMessage, replies);
        let reply = bestMatch ? replies[bestMatch] : null;

        if (!reply) {
            // If no reply exists, ask for a new response to be learned
            const newResponse = readlineSync.question(learn(chalk.yellow(`No response found for "${receivedMessage}". Enter a reply to be learned: `)));

            if (newResponse.trim()) {
                // Add the new response to the replies object
                replies[receivedMessage] = newResponse.trim();
                saveReplyToFile(receivedMessage, newResponse.trim());
                learn(chalk.green(`Learned and saved new response.`));
                reply = newResponse.trim();
            }
        }

        // Send the reply (whether from file or newly learned)
        if (reply) {
            client.chatMessage(steamID, reply);
        } else {
            learn(chalk.red("No reply provided for the message and learning was skipped."));
        }
    } else {
        error(chalk.red("Unable to Auto-answer."));
    }
});

// Function to get the best match from the replies using fuzzy matching
function getBestMatch(receivedMessage, replies) {
    const keys = Object.keys(replies);
    const matches = stringSimilarity.findBestMatch(receivedMessage, keys);
    
    // Return the best match if similarity is above a threshold
    return matches.bestMatch.rating > 0.5 ? matches.bestMatch.target : null; // Adjust threshold as needed
}

// Function to save a new reply to the memory.txt file
function saveReplyToFile(key, value) {
    const filePath = path.join(__dirname, 'memory.txt');
    const formattedLine = `${key}: ${value}\n`;

    fs.appendFileSync(filePath, formattedLine, (err) => {
        if (err) {
            error(chalk.red("Failed to write new responses."));
        }
    });
}

/**********************************************************************************************
    LOGGING OFF SYSTEM & ERROR HANDLER
***********************************************************************************************/

client.on("disconnected", () => {
    settings.games_id.forEach(gameId => stopGameTracking(gameId)); // Stop tracking playtime
    AppGameIDPlayTime(); // Show final playtimes when the bot stops
    log(chalk.yellow("Disconnected from Steam."));
    shutdown(0);
});

client.on("error", (e) => {
    console.log(chalk.white.bold.bgRed("    Connection Status    "));
    
    switch(e.eresult) {
        case SteamUserReserved.EResult.InvalidPassword:
            error(chalk.red("Login failed: The password entered is incorrect. Please check your credentials and try again."));
            shutdown();
            break;
        case SteamUserReserved.EResult.AlreadyLoggedInElsewhere:
            error(chalk.red("Login failed: The account is already logged in elsewhere. Please log out from other devices and try again."));
            shutdown();
            break;
        case SteamUserReserved.EResult.AccountLogonDenied:
            error(chalk.red("Login failed: SteamGuard authentication is required. Please check your email or mobile app for the SteamGuard code."));
            
            // Prompt for SteamGuard code
            let retrySteamGuard = readlineSync.question(chalk.gray.bold(" Enter SteamGuard App Code ") + ": ", { hideEchoBack: true });
            client.logOn({ 
                accountName: loadedCredentials.username, 
                password: loadedCredentials.password, 
                twoFactorCode: retrySteamGuard 
            });
            return; // Don't shut down, reattempt login
        case SteamUserReserved.EResult.RateLimitExceeded:
            error(chalk.red("Login failed: Rate limit exceeded. Too many login attempts. Please wait a few minutes and try again."));
            shutdown();
            break;
        case SteamUserReserved.EResult.Timeout:
            error(chalk.red("Connection failed: The connection to Steam timed out. This could be due to network issues. Please check your connection and try again."));
            shutdown();
            break;
        default:
            error(chalk.red(`An unknown error occurred: ${e.message} (Error code: ${e.eresult}). Please refer to the Steam documentation or contact support for assistance.`));
            shutdown();
    }
});

// Catch SIGINT and SIGTERM to safely shut down the bot
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
