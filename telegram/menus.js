// telegram/menu.js

function getStartMenu(ctx) {
  const config = require("../config");

  const username = ctx.from?.username
    ? `@${ctx.from.username}`
    : ctx.from?.first_name || "User";

  const userId = String(ctx.from?.id || "");

  const isOwner = config.ownerIds.includes(userId);

  /*
   * Premium status will be supplied by handlers/database later.
   * For now this safely defaults to NO.
   */
  const isPremium = false;

  // ==================================================
  // REGULAR USER MENU
  // ==================================================

  let menu = `╭━━━〔 🛡️ Bᴀɴ Sʏsᴛᴇᴍ 〕━━━╮

👋 Wᴇʟᴄᴏᴍᴇ, ${username}

⚡ Yᴏᴜʀ Uʟᴛɪᴍᴀᴛᴇ Bᴀɴ & Uɴʙᴀɴ Sʏsᴛᴇᴍ
💀 Pᴏᴡᴇʀᴇᴅ Bʏ 𝐒𝐈𝐌𝐎𝐍 𝐓𝐄𝐂𝐇 × Dʏɴᴀsᴛʏ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Yᴏᴜʀ Sᴛᴀᴛᴜs

├ 💎 Pʀᴇᴍɪᴜᴍ: ${isPremium ? "Yᴇs" : "Nᴏ"}
├ 👑 Oᴡɴᴇʀ: ${isOwner ? "Yᴇs" : "Nᴏ"}
├ 🆔 Uѕᴇʀ ID: ${userId}
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

💳 Aᴄᴄᴏᴜɴᴛ & Rᴇǫᴜᴇsᴛs

├ 💰 /balance
├ 💳 /deposit
├ 📜 /deposits
├ 💸 /transactions
├ 🎁 /referral
├ 👤 /profile
├ 🆔 /id
├ 📋 /request
├ 📩 /myrequests
├ 📚 /history
├ 📊 /status
└ ❌ /cancel

ℹ️ Hᴇʟᴘ & Iɴғᴏ

├ 📋 /services
├ 💵 /price
└ ℹ️ /help`;

  // ==================================================
  // OWNER COMMANDS
  // ==================================================

  if (isOwner) {
    menu += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👑 Oᴡɴᴇʀ Cᴏᴍᴍᴀɴᴅs

🎛️ Pᴀɴᴇʟ
├ 👑 /owner
├ ⚡ /panel
├ 📋 /requests
├ ⏳ /pending
├ ✅ /approve
└ ❌ /reject

💳 Pᴀʏᴍᴇɴᴛs
├ 💰 /payments
└ 🔎 /paymentinfo

👥 Uѕᴇʀ Mᴀɴᴀɢᴇᴍᴇɴᴛ
├ 👥 /users
├ 🔎 /userinfo
├ 🚫 /banlist
└ 📜 /logs

💎 Pʀᴇᴍɪᴜᴍ Mᴀɴᴀɢᴇᴍᴇɴᴛ
├ 💎 /premium USER_ID
├ 🔴 /premiumoff USER_ID
├ 🔎 /premiuminfo USER_ID
└ 📋 /premiumusers

💰 Wᴀʟʟᴇᴛ Aᴅᴍɪɴ
├ ➕ /credit USER_ID AMOUNT
└ ➖ /debit USER_ID AMOUNT

⚙️ Sʏsᴛᴇᴍ
├ 📊 /stats
├ 📢 /broadcast
├ 🔧 /maintenance
├ ⚙️ /settings
└ 🔄 /restart`;
  }

  // ==================================================
  // FOOTER
  // ==================================================

  menu += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Aʟʟ Rᴇǫᴜᴇsᴛs Rᴇǫᴜɪʀᴇ Oᴡɴᴇʀ Rᴇᴠɪᴇᴡ.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  return menu;
}

module.exports = {
  getStartMenu
};
