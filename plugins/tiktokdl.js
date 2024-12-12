const axios = require("axios");
const { cmd, commands } = require("../command");

/**
 * TikTok Downloader Command
 * Downloads TikTok videos without a watermark.
 */
cmd({
    pattern: "tik",
    desc: "Download TikTok videos",
    category: "download",
    react: "🎥",
    filename: __filename,
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        // Validate the user input
        if (!q) {
            return reply("*❌ කරුණාකර TikTok Link එකක් ලබා දෙන්න!*");
        }
        
        // Ensure the provided link is a valid TikTok URL
        if (!q.includes("tiktok.com")) {
            return reply("*🚫 කෘතදෝෂයකි. එය TikTok Link එකක් බව නිවැරදිව තහවුරු කරන්න.*");
        }

        // Inform user that the download is in progress
        await reply("*⬇️ TikTok Video එක Download වෙමින් පවතී...*");

        // TikTok downloader API endpoint
        const apiURL = `https://api.tiklydown.com/v1/video?url=${encodeURIComponent(q)}`;

        // Fetch video data using Axios
        const { data } = await axios.get(apiURL);

        if (data && data.video && data.video.no_watermark) {
            const videoUrl = data.video.no_watermark;

            // Create a description for the download
            const desc = `╭━❮◆ SENAL MD TIKTOK DOWNLOADER ◆❯━╮
┃➤✰ 𝚄𝚁𝙻 : ${q}
┃➤✰ 𝚃𝚈𝙿𝙴 : TikTok Video
╰━━━━━━━━━━━━━━━⪼

> ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝙴𝙽𝙰𝙻`;

            // Send metadata and video
            await conn.sendMessage(from, { caption: desc }, { quoted: mek });
            await conn.sendMessage(from, {
                video: { url: videoUrl },
                mimetype: "video/mp4",
                caption: "©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚂𝙴𝙽𝙰𝙻 𝙼𝙳",
            }, { quoted: mek });

            // Inform the user that the upload is complete
            await reply("*✅ TikTok Video එක සාර්ථකව Upload කර ඇත!*");
        } else {
            // Handle cases where the video cannot be downloaded
            reply("*🚫 Video Download Link සොයාගත නොහැක.*");
        }
    } catch (e) {
        // Handle errors
        reply(`🚫 *දෝෂයක් ඇති විය:*\n${e}`);
    }
});
