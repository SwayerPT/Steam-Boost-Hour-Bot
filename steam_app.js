/*
    Project: Steam Hour Bot - NodeJS
    Note: By using this bot I will not be responsible if you edit the code for bad purposes.
    
    Created by SwayerPT with Love.
    Donate your candie and help to improve with new projects.
    https://steamcommunity.com/id/swayerpt/
*/

const SteamUserReserved = require("steam-user");
const fs = require("fs");
const readlineSync = require("readline-sync");
const chalk = require("chalk");
const SteamCommunity = require("steamcommunity");
const axios = require("axios");  // New dependency

// Initialize Steam client and other necessary variables
const client = new SteamUserReserved();
const settings = {
    acceptRandomFriendRequests: false,
    acceptItemNotify: true,
    acceptTradesNotify: true,
    acceptReplys: false,
    limits: 25,
    restriction: 5,
    games_id: [],
    proceedWithBannedAccount: false // New setting to handle banned accounts
};

let mobileCode, version = "v1.5.1";

// Displaying the header
console.log(chalk.white.bold.bgBlack("    Developed by: SwayerPT     "));
console.log(chalk.white.bold.bgBlack("    Steam Hour [Bot]     "));
console.log(chalk.gray.underline("                   " + version));
console.log(chalk.black.bold.bgWhite("      Steam Login        "));

// Function to get input from user
function getInput() {
    let gamesid = readlineSync.question(chalk.gray.bold(" GamesID (comma-separated) ") + ": ");
    let username = readlineSync.question(chalk.gray.bold(" Username ") + ": ");
    let password = readlineSync.question(chalk.gray.bold(" Password ") + ": ", { hideEchoBack: true });
    let hasTwoFactorCode = readlineSync.keyInYNStrict(chalk.gray.bold(" Do you have a SteamGuard? ") + ": ");
    return { gamesid, username, password, hasTwoFactorCode };
}

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

// Function for logging
function log(message) {
    let timestamp = new Date().toLocaleTimeString();
    console.log(" " + timestamp + " - \x1b[36m%s\x1b[0m", "[STEAM] " + message);
}

// Function for error logging
function error(message) {
    let timestamp = new Date().toLocaleTimeString();
    console.log(" " + timestamp + " - \x1b[36m%s\x1b[0m", "[ERROR] " + message);
}

// Function for shutting down the bot
function shutdown(exitCode = 0) {
    log(chalk.red("Connection Lost..."));
    client.logOff();
    client.once("disconnected", () => process.exit(exitCode));
    setTimeout(() => process.exit(exitCode), 500);
}

// Log in to Steam
const { gamesid, username, password, hasTwoFactorCode } = getInput();
settings.games_id = parseInput(gamesid);

if (hasTwoFactorCode) {
    while (true) {
        mobileCode = readlineSync.question(chalk.gray.bold(" SteamGuard ") + ": ", { hideEchoBack: true });

        try {
            client.logOn({ accountName: username, password: password, twoFactorCode: mobileCode });
            break; // If login is successful, break out of the loop
        } catch (e) {
            if (e.eresult === SteamUserReserved.EResult.AccountLogonDenied) {
                log(chalk.red("Wrong, you have SteamGuard. Please insert your SteamGuard code again:"));
            } else {
                throw e; // Handle other errors normally
            }
        }
    }
} else {
    client.logOn({ accountName: username, password: password });
}

client.on("loggedOn", () => {
    client.setPersona(SteamUserReserved.EPersonaState.Away);

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
                    let proceed = readlineSync.keyInYNStrict(chalk.red("Do you still want to proceed with game-banned accounts? ") + ": ");
                    settings.proceedWithBannedAccount = proceed;

                    if (!settings.proceedWithBannedAccount) {
                        log(chalk.red("[BOT] not able to proceed with banned games."));
                        shutdown();
                    }
                }
            });
        });
        log(chalk.yellow("Tip: Use (CTRL + C) to Logout."));
        client.gamesPlayed(CountGamesUsed(settings.games_id));
    }
});

if (fs.existsSync("servers")) {
    SteamUserReserved.servers = JSON.parse(fs.readFileSync("servers"));
    log(chalk.green("Connecting ..."));
}

client.on("connected", () => {
    log(chalk.green("Starting Bot..."));
});

client.on("accountLimitations", (limited, communityBanned, locked, canInviteFriends) => {
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

    if (limited) {
        if (settings.games_id.length < settings.restriction) {
            log(chalk.blue("This Account is Limited."));
            log(chalk.green("[Limited] Currently In-Game " + settings.games_id.length + "."));
        } else {
            error(chalk.red("Exceeded the limit of 5 Games..."));
            shutdown();
        }
    } else {
        if (settings.games_id.length < settings.limits) {
            log(chalk.green("Currently In-Game " + settings.games_id.join(", ") + "."));
        } else {
            error(chalk.red("Exceeded the limit of 25 Games."));
            shutdown();
        }
    }
});

client.on("friendRelationship", (steamID, relationship) => {
    if (relationship === 2 && settings.acceptRandomFriendRequests) {
        client.addFriend(steamID);
        log(chalk.yellow("You have an invite from " + steamID + "."));
    } else {
        error(chalk.red("Unable to Accept Requests."));
    }
});

client.on("newItems", (count) => {
    if (settings.acceptItemNotify && count > 0) {
        log(chalk.yellow("You received (" + count + ") items in your Inventory."));
    } else {
        error(chalk.red("Unable to Drop."));
    }
});

client.on("tradeOffers", (count, steamID) => {
    if (settings.acceptTradesNotify && count > 0) {
        log(chalk.yellow("You received (" + count + ") Trade Offer from " + steamID + "."));
    } else {
        error(chalk.red("Unable to Trade."));
    }
});

client.on("friendMessage", (steamID, message) => {
    log(chalk.yellow("Received a message from " + steamID.getSteam3RenderedID() + " saying: " + message));
    if (settings.acceptReplys) {
        switch (message.toLowerCase()) {
            case "hello":
                client.chatMessage(steamID, "Yoo, wait a moment. ;D");
                break;
            case "play":
                client.chatMessage(steamID, "Not now... I'm making missions");
                break;
            case "why":
                client.chatMessage(steamID, "Because I'm doing something");
                break;
            case "yo":
                client.chatMessage(steamID, "Yoo, wait a moment ;D");
                break;
            case "do you want to play?":
                client.chatMessage(steamID, "Not now");
                break;
            case "whatsup":
                client.chatMessage(steamID, "Hey");
                break;
            case "are you there?":
                client.chatMessage(steamID, "Yes, but I'm leaving... bye");
                break;
            case "...":
                client.chatMessage(steamID, "Not now!");
                break;
            case "yes":
                client.chatMessage(steamID, "Not now!");
                break;
            default:
                client.chatMessage(steamID, "Sorry, I can't chat right now.");
        }
    } else {
        error(chalk.red("Unable to Auto-answer."));
    }
});

client.on("error", (e) => {
    console.log(chalk.white.bold.bgRed("    Connection Status    "));
    if (e.eresult === SteamUserReserved.EResult.InvalidPassword) {
        error(chalk.red("User or Password Wrong."));
        shutdown();
    } else if (e.eresult === SteamUserReserved.EResult.AlreadyLoggedInElsewhere) {
        error(chalk.red("Already logged in!"));
        shutdown();
    } else if (e.eresult === SteamUserReserved.EResult.AccountLogonDenied) {
        error(chalk.red("SteamGuard is required!"));

        // If the user said "No" but SteamGuard is required, prompt them to enter the code
        let retrySteamGuard = readlineSync.question(chalk.gray.bold(" SteamGuard App Code ") + ": ", { hideEchoBack: true });
        client.logOn({ accountName: username, password: password, twoFactorCode: retrySteamGuard });
    } else {
        error(chalk.red("An unknown error occurred."));
        shutdown();
    }
});

process.on("SIGINT", shutdown);