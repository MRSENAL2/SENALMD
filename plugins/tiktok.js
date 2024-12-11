const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktokdl",
    desc: "Download TikTok video without watermark",
    category: "download",
    react: "🎥",
    filename: __filename,
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        if (!q || !q.startsWith("https://www.tiktok.com/")) {
            return reply("*කරුණාකර TikTok ලින්ක් එකක් ලබා දෙන්න 🔗...*");
        }

        // Use Snaptik API or equivalent service to fetch the video download link
        const snaptikApiUrl = `https://api.dylux.dev/tiktok?url=${encodeURIComponent(q)}`; // Replace with actual API endpoint
        const { data } = await axios.get(snaptikApiUrl);

        if (!data || !data.video) {
            return reply("*🚫 ලින්ක් එකෙන් වීඩියෝ ලබාගත නොහැක!*");
        }

        // Generate video information
        let des = `╭━❮◆ SENAL MD TIKTOK DOWNLOADER ◆❯━╮
┃➤✰ 𝚃𝙸𝚃𝙻𝙴 : TikTok Video
┃➤✰ 𝙻𝙸𝙽𝙺 : ${q}
╰━━━━━━━━━━━━━━━⪼

> ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝙴𝙽𝙰𝙻`;

        // Send video information
        await conn.sendMessage(from, { text: des }, { quoted: mek });

        // Send downloading message
        await reply("*_Downloading_*   ⬇️");

        // Send the video directly to WhatsApp
        await conn.sendMessage(from, { video: { url: data.video }, mimetype: "video/mp4", caption: "©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝙴𝙽𝙰𝙻 𝙼𝙳" }, { quoted: mek });

        // Send uploaded message
        await reply("*_UPLOADED_*  ✅");
    } catch (error) {
        console.error(error);
        reply(`🚫 *දෝෂයක් ඇති විය:*\n${error.message}`);
    }
});
