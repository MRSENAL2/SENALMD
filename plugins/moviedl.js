const { fetchJson } = require('../lib/functions')
const config = require('../config')
const { cmd } = require('../command')

const yourName = "❗මෙය වෙබ් පිටපතක් වන අතර,සිංහල උපසිරැසි වෙනම එකතු කරගැනීමට *සිංහල උපසිරැසි* Button එක click කරන්න.\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜱᴀʜᴀꜱ ᴛᴇᴄʜ*\n\n 🎬*ꜱᴀʜᴀꜱ ᴍᴅ ᴄɪɴᴇʀᴜ.ʟᴋ ᴍᴏᴠɪᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*🎬​";

cmd({
    pattern: "movied",
    alias: ["googledrivemovie", "gdrivemovie"],
    desc: "Download Google Drive movie",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Check if the input URL is provided and starts with "https://drive.google.com"
        if (!q || !q.startsWith("https://drive.google.com")) {
            return reply("I'm having trouble figuring this out🤔. Only use valid Google Drive links.");
        }

        // Extract file ID from the Google Drive URL
        const fileId = q.split('/d/')[1]?.split('/')[0];
        if (!fileId) {
            return reply("Sorry, I couldn't extract the file ID from the link.");
        }

        // Construct the direct download URL
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        reply("🎬 *THENU ᴍᴅ ᴄɪɴᴇʀᴜ.ʟᴋ ᴍᴏᴠɪᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* 🎬​ \n*--------------------------------------------*\n𝕐𝕆𝕌ℝ 𝕄𝕆𝕍𝕀𝔼 𝕀𝕊\n*📤𝕌ℙ𝕃𝕆𝔸ᴅ𝕀ℕ𝔾 ◽◽◽◽◽◽*\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ THENU-AI*");

        // Send the movie file link
        await conn.sendMessage(from, {
            document: { url: downloadUrl },
            fileName: "Movie.mp4",  // You can adjust the file name accordingly
            mimetype: "video/mp4",
            caption: `🍟Movie Name: Google Drive Movie | \n🍫Bot Owner: 94767096711 \n\n${yourName}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

