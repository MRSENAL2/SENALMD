const fs = require('fs');
const path = require('path');

// Define the responses object with corrected file paths
const responses = {
  "hi": {
    voice: "./database/voice/hi.mp3", // Corrected path to database/voice folder
    text: null,
  },
  "gn": {
    voice: "./database/voice/gn.mp3", // Corrected path
    text: null,
  },
  "goodnight": {
    voice: "./database/voice/gn.mp3", // Corrected path
    text: null,
  },
  ".song": {
    voice: "./database/voice/.song.mp3", // Corrected path
    text: null,
  },
  ".video": {
    voice: "./database/voice/.video.mp3", // Corrected path
    text: null,
  },
  ".alive": {
    voice: "./database/voice/.alive.mp3", // Corrected path
    text: null,
  },
  "kwd": {
    voice: "./database/voice/ou.mp3", // Corrected path
    text: "Oya kala da? 😋",
  },
  "kawada": {
    voice: "./database/voice/ou.mp3", // Corrected path
    text: "Oya kala da? 😋",
  },
  ".tiktok": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".mediafire": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".mfire": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".gdrive": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".googledrive": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".fb": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".facebook": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".insta": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
  ".instagram": {
    voice: "./database/voice/dl.mp3", // Corrected path
    text: null,
  },
};

// Function to handle incoming messages
module.exports = async (message, sock) => {
  try {
    // Extract content from the incoming message
    const content = message.message.conversation || message.message.extendedTextMessage?.text || "";
    const lowerContent = content.toLowerCase();
    console.log("Received message:", lowerContent); // Debugging log

    // Match the message with predefined responses
    for (const [key, response] of Object.entries(responses)) {
      if (lowerContent.includes(key)) {
        console.log(`Matched keyword: ${key}`); // Debugging log

        // Send voice reply if available
        if (response.voice) {
          const voicePath = path.resolve(__dirname, response.voice);
          console.log(`Voice file path: ${voicePath}`); // Debugging log
          
          // Check if the file exists
          if (fs.existsSync(voicePath)) {
            try {
              console.log(`Sending voice note from: ${voicePath}`); // Debugging log
              await sock.sendMessage(message.key.remoteJid, { audio: { url: voicePath }, mimetype: 'audio/mp4' });
            } catch (err) {
              console.error("Error sending audio:", err); // Error if audio can't be sent
            }
          } else {
            console.error(`Voice file not found: ${voicePath}`);
          }
        }

        // Send text reply if available
        if (response.text) {
          console.log(`Sending text: ${response.text}`); // Debugging log
          try {
            await sock.sendMessage(message.key.remoteJid, { text: response.text });
          } catch (err) {
            console.error("Error sending text:", err); // Error if text can't be sent
          }
        }

        // Stop further processing once a match is found
        break;
      }
    }
  } catch (error) {
    console.error("Error in auto-reply plugin:", error);
  }
};
