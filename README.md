<h1 align="center">
  <img src="http://i.imgur.com/tq28TqF.png" height="80" width="80" />
  <br/>
  Steam Boost Hour [Bot]
</h1>

## ⚠️ WARNING: DO NOT USE THE ORIGINAL VERSION

This repository is a secure fork of the original [Steam-Boost-Hour-Bot](https://github.com/SwayerPT/Steam-Boost-Hour-Bot) by [SwayerPT](https://github.com/SwayerPT).  

The original repository has **serious security flaws** and **misleads users by falsely claiming that credentials are encrypted**. As of now, the original README **still claims that the bot encrypts credentials**, which is untrue. In reality, your Steam username and password are stored in plain text, putting your account at risk.

### My Attempts to Address the Issue:
- I raised two issues in the original repository to notify the maintainer about the security risk.
- Both issues were deleted after the maintainer responded dismissively, saying:

> Friend, don't be rube like that saying, the bot is secure anyway and is working as should. Yes, is not encrypting as should to the plain text because I am developing that part, and is not completed yet. You can still using the before releases to be more secure if you'd like.  
> Anyway, the bot still secure logging and keeping the details in your local txt file, because is in your PC/Localhost. This days is hard to steal a steam account, because you have more aways to use T2F.  
> That's not the point.

Despite acknowledging that credentials are not encrypted, the maintainer continues to claim in the README that they are. This gives users a false sense of security and puts their Steam accounts at risk.

---

## ✅ Why This Fork Is Secure:
- **Credentials are encrypted** using a user generated password.
- Resolved the security flaws ignored in the original version.

---

## 🎯 Features
- Securely encrypts and stores Steam credentials.
- Simulates playtime for selected Steam games.
- Tracks and logs playtime for each game.
- Simple setup and configuration.

---

## ⚙️ Setup & Installation
1. Install [Node.js](https://nodejs.org/) (version 14.x or higher).
2. Clone or download this repository as a ZIP file.
3. Run `install.bat` to install dependencies.
4. Start the bot with `start.bat`.

---

### **Protect your account. Do not use the insecure original repository.**
