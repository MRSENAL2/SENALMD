const { cmd } = require('../command');
const fbDownloader = require('fb-downloader'); // Import fb-downloader
const getVideoUrlFromShareLink = require('../lib/fbScraper'); // Import the puppeteer scraper

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
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q || !q.startsWith("https://")) {
            return reply("Please provide a valid Facebook video URL!");
        }

        // If it's a sharing link, scrape the video URL
        const videoUrl = await getVideoUrlFromShareLink(q);

        if (!videoUrl) {
            return reply("Sorry, I couldn't fetch the video URL from this sharing link.");
        }

        // Use fb-downloader to fetch video details
        const video = await fbDownloader(videoUrl);

        if (!video || !video.hd && !video.sd) {
            return reply("Sorry, no downloadable video found at this URL.");
        }

        // Send the HD video if available
        if (video.hd) {
            await conn.sendMessage(from, {
                video: { url: video.hd },
                mimetype: "video/mp4",
                caption: `🎥 *HD Video*\n\n${yourName}`
            }, { quoted: mek });
        }

        // Send the SD video if available
        if (video.sd) {
            await conn.sendMessage(from, {
                video: { url: video.sd },
                mimetype: "video/mp4",
                caption: `🎥 *SD Video*\n\n${yourName}`
            }, { quoted: mek });
        }

    } catch (e) {
        console.error('Error in fbdl.js plugin:', e);
        reply('An error occurred while processing your request: ' + e.message);
    }
});
