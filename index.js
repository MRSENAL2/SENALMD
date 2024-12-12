const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const { File } = require('megajs');
const express = require("express");
const path = require("path");

(async () => {
  // Dynamically import node-fetch
  const fetchModule = await import('node-fetch');
  const fetch = fetchModule.default;
  globalThis.fetch = fetch; // Assign fetch globally

  const prefix = '.';
  const ownerNumber = ['94767707223'];
  const port = process.env.PORT || 8000;

  //===================SESSION-AUTH============================
  if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!process.env.SESSION_ID) return console.log('Please add your session to SESSION_ID env!!');
    const sessdata = process.env.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
      if (err) throw err;
      fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
        console.log("Session downloaded ✅");
      });
    });
  }

  //===================SERVER SETUP============================
  const app = express();
  app.get("/", (req, res) => res.send("Bot started successfully ✅"));
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

  //===================CONNECT TO WA============================
  async function connectToWA() {
    console.log("Connecting to WhatsApp...");

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version
    });

    conn.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const reason = lastDisconnect.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
          console.log("Reconnecting...");
          connectToWA();
        } else {
          console.log("Connection closed. You are logged out.");
        }
      } else if (connection === 'open') {
        console.log("Connected to WhatsApp ✅");
        installPlugins(conn);
      }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
      try {
        handleMessages(conn, mek);
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });
  }

  //===================INSTALL PLUGINS============================
  function installPlugins(conn) {
    console.log("Installing plugins...");
    fs.readdirSync("./plugins/").forEach((plugin) => {
      if (path.extname(plugin).toLowerCase() === ".js") {
        require("./plugins/" + plugin);
      }
    });
    console.log("Plugins installed successfully ✅");

    // Send notification to the owner
    conn.sendMessage(`${ownerNumber[0]}@s.whatsapp.net`, {
      image: { url: `https://telegra.ph/file/900435c6d3157c98c3c88.jpg` },
      caption: `Bot connected successfully ✅\n\nPREFIX: ${prefix}`
    });
  }

  //===================HANDLE MESSAGES============================
  async function handleMessages(conn, mek) {
    mek = mek.messages[0];
    if (!mek.message) return;

    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = mek.key.fromMe ? conn.user.id : mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    const isCmd = mek.message.conversation?.startsWith(prefix);

    const body = mek.message.conversation || "";
    const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : "";
    const args = body.trim().split(/ +/).slice(1);

    if (isCmd) {
      console.log(`Command received: ${command} from ${senderNumber}`);
      // Command handler logic here
    }
  }

  //===================START BOT============================
  setTimeout(() => connectToWA(), 4000);
})();
