// Required Libraries
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Environment Configurations
require('dotenv').config();
const PORT = process.env.PORT || 8000;
const SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.error('ERROR: SESSION_ID is missing in environment variables.');
    process.exit(1);
}

// Paths
const authFolder = path.join(__dirname, 'auth_info_baileys');
const sessionFile = path.join(authFolder, 'creds.json');

// Ensure Auth Directory Exists
if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder);
}

// Helper function to construct MEGA download URL
function constructMegaDownloadURL(fileId) {
    return `https://mega.nz/file/${fileId}`;
}

// Download Session File if SESSION_ID Provided
(async () => {
    if (!fs.existsSync(sessionFile)) {
        console.log('Downloading session file from MEGA link...');
        try {
            // Replace this line with actual MEGA file ID if needed
            const megaURL = constructMegaDownloadURL(SESSION_ID);
            const response = await axios({ url: megaURL, method: 'GET', responseType: 'stream' });
            const writer = fs.createWriteStream(sessionFile);
            response.data.pipe(writer);
            writer.on('finish', () => console.log('Session file downloaded successfully.'));
            writer.on('error', (err) => console.error('Error writing session file:', err));
        } catch (err) {
            console.error('Failed to download session file:', err);
            process.exit(1);
        }
    }
})();

// Express Server for Status
const app = express();
app.get('/', (req, res) => res.send('Senal MD Bot is running!'));
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// Connect to WhatsApp
async function connectToWA() {
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
        auth: state,
        browser: Browsers.macOS('Firefox'),
        printQRInTerminal: false, // Disable QR in terminal
    });

    // Connection Update Listener
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Scan the QR code to connect:');
            qrcode.generate(qr, { small: false }); // Use large QR code for better clarity
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('Connection closed. Reason:', reason);

            if (reason !== DisconnectReason.loggedOut) {
                console.log('Reconnecting...');
                connectToWA();
            } else {
                console.log('Session logged out. Delete the session file to reconnect.');
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connected successfully!');
            sock.sendMessage(sock.user.id, { text: 'Well done Mr Senal, the bot is online!' });
        }
    });

    // Event Listener for Messages
    sock.ev.on('messages.upsert', async (message) => {
        const msg = message.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const body = type === 'conversation' ? msg.message.conversation : '';

        if (body === '.alive') {
            await sock.sendMessage(from, { text: 'Im Alive Now ♿' });
        } else if (body === '.menu') {
            const menuImage = 'https://telegra.ph/file/f2be313fe820b56b47748.png';
            await sock.sendMessage(from, {
                image: { url: menuImage },
                caption: '*Senal MD Menu*\n\n- .alive\n- .help\n- .sticker\n\nɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ ᴍʀ ꜱᴇɴᴀʟ',
            });
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

connectToWA();
