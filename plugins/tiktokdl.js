const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { cmd, commands } = require('../command');

cmd({
    pattern: "tiktokd",
    desc: "Download TikTok videos or images",
    category: "download",
    react: "🎵",
    filename: __filename,
}, async (message, client) => {
    const chatId = message.chatId;
    const args = message.body.split(' ');
    const tiktokUrl = args[1]; // Assuming the command is "!tiktokd <URL>"

    if (!tiktokUrl) {
        return client.sendMessage(chatId, { text: 'Please provide a valid TikTok URL!' });
    }

    try {
        // Fetch TikTok content
        const result = await downloadTiktok(tiktokUrl);

        if (result && result.status) {
            const { title, image, dl_link } = result.result;
            const downloadMp4 = dl_link.download_mp4_hd || dl_link.download_mp4_1;

            if (downloadMp4) {
                // Send video file
                await client.sendMessage(chatId, {
                    video: { url: downloadMp4 },
                    caption: `*Title:* ${title}`,
                });
            } else if (dl_link.images && dl_link.images.length > 0) {
                // Send image carousel if images exist
                const images = dl_link.images.map((img) => ({
                    url: img,
                    caption: title,
                }));
                for (const img of images) {
                    await client.sendMessage(chatId, { image: { url: img.url }, caption: title });
                }
            } else {
                await client.sendMessage(chatId, { text: 'No downloadable content found.' });
            }
        } else {
            await client.sendMessage(chatId, { text: 'Failed to fetch TikTok content. Please try again.' });
        }
    } catch (error) {
        console.error(error);
        await client.sendMessage(chatId, { text: 'An error occurred while processing the TikTok URL.' });
    }
});
