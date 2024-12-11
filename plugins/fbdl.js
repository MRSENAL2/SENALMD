const { cmd } = require('../command');
const fbDownloader = require('fb-downloader'); // Import fb-downloader

const yourName = "*©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴠɪɴ ᴋɪɴɢ*";

// Facebook video downloader plugin
cmd({
    pattern: "fbd",
    alias: ["facebook", "fbvideo"],
    desc: "Download Facebook videos",
    category: "download",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, q, reply }) => {
    try {
        if (!q || !q.startsWith("https://")) {
            return reply("Please provide a valid Facebook video URL!");
        }

        // Use fb-downloader to fetch video details
        const video = await fbDownloader(q);

        if (!video || (!video.hd && !video.sd)) {
            return reply("Sorry, no downloadable video found at this URL.");
        }

        // Send the HD video if available
        if (video.hd) {
            await conn.sendMessage(from, {
                video: { url: video.hd },
                mimetype: "video/mp4",
                caption: `🎥 *HD Video*\n\n${yourName}`
            }, { quoted: mek });
        } else if (video.sd) {
            // Send the SD video if available
            await conn.sendMessage(from, {
                video: { url: video.sd },
                mimetype: "video/mp4",
                caption: `🎥 *SD Video*\n\n${yourName}`
            }, { quoted: mek });
        }
    } catch (error) {
        console.error('Error in fbdl.js plugin:', error);
        reply('An error occurred while processing your request: ' + error.message);
    }
});
