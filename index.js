const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');
const prefix = '.';

const ownerNumber = ['94767707223'];

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if (err) {
            console.error('Error downloading session:', err);
            return;
        }
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("Session downloaded ✅");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//=============================================

async function connectToWA() {
    console.log("Connecting Senal MD BOT ⏳️...");
    try {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
        const { version } = await fetchLatestBaileysVersion();
        console.log('Using Baileys version:', version);

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
            console.log("Connection update:", update);

            if (connection === 'close') {
                if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                    console.log("Reconnecting...");
                    connectToWA();
                } else {
                    console.log("Logged out, cannot reconnect");
                }
            } else if (connection === 'open') {
                console.log('Bot connected to WhatsApp ✅');
                console.log('🧬 Installing plugins...');
                const path = require('path');
                fs.readdirSync("./plugins/").forEach((plugin) => {
                    if (path.extname(plugin).toLowerCase() == ".js") {
                        require("./plugins/" + plugin);
                    }
                });
                console.log('Plugins installed successful ✅');
                let up = `Senal-MD connected successfully ✅\n\nPREFIX: ${prefix}`;
                conn.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url: `https://files.catbox.moe/gm88nn.png` }, caption: up });
            }
        });

        conn.ev.on('creds.update', saveCreds);
        conn.ev.on('messages.upsert', async (mek) => {
            mek = mek.messages[0];
            if (!mek.message) return;
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

            if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
                await conn.readMessages([mek.key]);
            }

            const m = sms(conn, mek);
            const type = getContentType(mek.message);
            const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);
            const q = args.join(' ');
            const from = mek.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid);
            const senderNumber = sender.split('@')[0];
            const botNumber = conn.user.id.split(':')[0];
            const pushname = mek.pushName || 'Sin Nombre';
            const isMe = botNumber.includes(senderNumber);
            const isOwner = ownerNumber.includes(senderNumber) || isMe;

            if (!isOwner && config.MODE === "private") return;
            if (!isOwner && isGroup && config.MODE === "inbox") return;
            if (!isOwner && !isGroup && config.MODE === "groups") return;

            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: mek });
            };

            if (senderNumber.includes("94767707223")) {
                if (mek.message.reactionMessage) return;
                m.react("👨‍💻");
            }

            if (config.AUTO_VOICE === 'true') {
                const url = 'https://raw.githubusercontent.com/DarkYasiyaofc/VOICE/main/Voice-Raw/FROZEN-V2';
                let { data } = await axios.get(url);
                for (vr in data) {
                    if ((new RegExp(`\\b${vr}\\b`, 'gi')).test(body)) conn.sendMessage(from, { audio: { url: data[vr] }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
                }
            }

            const events = require('./command');
            const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;

            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === cmdName) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                if (cmd) {
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                    try {
                        cmd.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner });
                    } catch (e) {
                        console.error("[PLUGIN ERROR] " + e);
                    }
                }
            }

            events.commands.map(async (command) => {
                if (body && command.on === "body") {
                    command.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner });
                } else if (mek.q && command.on === "text") {
                    command.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner });
                } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                    command.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner });
                } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                    command.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner });
                }
            });
        });
    } catch (error) {
        console.error("Error connecting to WhatsApp:", error);
        setTimeout(connectToWA, 5000); // Retry after 5 seconds
    }
}

app.get("/", (req, res) => {
    res.send("hey, malvin started✅");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

setTimeout(() => {
    connectToWA();
}, 4000);
