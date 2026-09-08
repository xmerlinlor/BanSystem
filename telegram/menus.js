function getStartMenu(ctx) {
  const config = require("../config");

  const username = ctx.from?.username
    ? `@${ctx.from.username}`
    : ctx.from?.first_name || "User";

  const isOwner = config.ownerIds.includes(String(ctx.from.id));

  return `╭━━━〔 🛡️ Bᴀɴ Sʏsᴛᴇᴍ 〕━━━╮

👋 Wᴇʟᴄᴏᴍᴇ, ${username}

⚡ Yᴏᴜʀ Uʟᴛɪᴍᴀᴛᴇ Bᴀɴ & Uɴʙᴀɴ Sʏsᴛᴇᴍ
💀 Pᴏᴡᴇʀᴇᴅ Bʏ 𝐒𝐈𝐌𝐎𝐍 𝐓𝐄𝐂𝐇 × Dʏɴᴀsᴛʏ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Yᴏᴜʀ Sᴛᴀᴛᴜs

├ 💎 Pʀᴇᴍɪᴜᴍ: Nᴏ
├ 👑 Oᴡɴᴇʀ: ${isOwner ? "Yᴇs" : "Nᴏ"}
├ 🆔 Uѕᴇʀ ID: ${ctx.from.id}
└ 👤 Uѕᴇʀ: ${username}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ Bᴀɴ Sᴇʀᴠɪᴄᴇs

📱 WʜᴀᴛsAᴘᴘ
├ ⚡ Uѕᴇʀ Bᴀɴ
├ 🔓 Uѕᴇʀ Uɴʙᴀɴ
├ 👥 Gʀᴏᴜᴘ Bᴀɴ
├ 👥 Gʀᴏᴜᴘ Uɴʙᴀɴ
├ 📢 Cʜᴀɴɴᴇʟ Bᴀɴ
└ 📢 Cʜᴀɴɴᴇʟ Uɴʙᴀɴ

✈️ Tᴇʟᴇɢʀᴀᴍ
├ ⚡ Uѕᴇʀ Bᴀɴ
├ 🔓 Uѕᴇʀ Uɴʙᴀɴ
├ 👥 Gʀᴏᴜᴘ Bᴀɴ
├ 👥 Gʀᴏᴜᴘ Uɴʙᴀɴ
├ 📢 Cʜᴀɴɴᴇʟ Bᴀɴ
├ 📢 Cʜᴀɴɴᴇʟ Uɴʙᴀɴ
└ 🤖 Bᴏᴛ Bᴀɴ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Pʀɪᴄɪɴɢ

👤 Uѕᴇʀ Bᴀɴ: ₦${config.prices.userBan}
🔓 Uѕᴇʀ Uɴʙᴀɴ: ₦${config.prices.userUnban}

👥 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Bᴀɴ: ₦${config.prices.groupChannelBan}
🔓 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Uɴʙᴀɴ: ₦${config.prices.groupChannelUnban}

🎁 Rᴇғᴇʀʀᴀʟ Rᴇᴡᴀʀᴅ: ₦${config.referral.reward}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 Pᴀʏᴍᴇɴᴛ
🎁 Rᴇғᴇʀʀᴀʟ
📩 Mʏ Rᴇǫᴜᴇsᴛs

👑 Aᴅᴍɪɴ Pᴀɴᴇʟ
⚡ Oᴡɴᴇʀ Pᴀɴᴇʟ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Aʟʟ Rᴇǫᴜᴇsᴛs Rᴇǫᴜɪʀᴇ Oᴡɴᴇʀ Rᴇᴠɪᴇᴡ.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}

module.exports = {
  getStartMenu
};
