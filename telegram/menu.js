// BAN SYSTEM MENU
// telegram/menu.js

const config = require("../config");

// ==================================================
// GET START MENU
// ==================================================

function getStartMenu(ctx) {
  const user = ctx?.from || {};

  const userId = String(user.id || "");

  const username = user.username
    ? `@${user.username}`
    : user.first_name || "User";

  const ownerIds = Array.isArray(config.ownerIds)
    ? config.ownerIds.map(String)
    : [];

  const isOwner = ownerIds.includes(userId);

  /*
   * Premium is intentionally handled by the handlers/database.
   * This menu does not require database.js.
   */
  const isPremium = false;

  // ==================================================
  // MAIN USER MENU
  // ==================================================

  let menu = `╭━━━〔 🛡️ Bᴀɴ Sʏsᴛᴇᴍ 〕━━━╮

👋 Wᴇʟᴄᴏᴍᴇ, ${username}

⚡ Yᴏᴜʀ Uʟᴛɪᴍᴀᴛᴇ Bᴀɴ & Uɴʙᴀɴ Sʏsᴛᴇᴍ
💀 Pᴏᴡᴇʀᴇᴅ Bʏ 𝐒𝐈𝐌𝐎𝐍 𝐓𝐄𝐂𝐇 × Dʏɴᴀsᴛʏ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Yᴏᴜʀ Sᴛᴀᴛᴜs

├ 💎 Pʀᴇᴍɪᴜᴍ: ${isPremium ? "Yᴇs 💎" : "Nᴏ"}
├ 👑 Oᴡɴᴇʀ: ${isOwner ? "Yᴇs 👑" : "Nᴏ"}
├ 🆔 Uѕᴇʀ ID: ${userId}
└ 👤 Uѕᴇʀ: ${username}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ Bᴀɴ Sᴇʀᴠɪᴄᴇs

📱 WʜᴀᴛsAᴘᴘ

├ ⚡ /ban NUMBER
├ 🔓 /unban NUMBER
├ 👥 /bangroup LINK
├ 🔓 /unbangroup LINK
├ 📢 /banchannel LINK
└ 🔓 /unbanchannel LINK

✈️ Tᴇʟᴇɢʀᴀᴍ

├ ⚡ /tgban ID
├ 🔓 /tgunban ID
├ 👥 /tggroupban ID
├ 🔓 /tggroupunban ID
├ 📢 /tgchannelban ID
└ 🔓 /tgchannelunban ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Pʀɪᴄɪɴɢ

👤 Uѕᴇʀ Bᴀɴ: ₦${config.prices?.userBan ?? 0}
🔓 Uѕᴇʀ Uɴʙᴀɴ: ₦${config.prices?.userUnban ?? 0}

👥 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Bᴀɴ: ₦${config.prices?.groupChannelBan ?? 0}
🔓 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Uɴʙᴀɴ: ₦${config.prices?.groupChannelUnban ?? 0}

🎁 Rᴇғᴇʀʀᴀʟ Rᴇᴡᴀʀᴅ: ₦${config.referral?.reward ?? 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 Aᴄᴄᴏᴜɴᴛ & Rᴇǫᴜᴇsᴛs

├ 💰 /balance
├ 💳 /deposit
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
  // PREMIUM SECTION
  // ==================================================

  if (isPremium) {
    menu += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 Pʀᴇᴍɪᴜᴍ Aᴄᴄᴇss

├ 💎 Sᴛᴀᴛᴜs: Aᴄᴛɪᴠᴇ
├ ⚡ Pʀᴇᴍɪᴜᴍ Aᴄᴄᴇss
└ 👑 Pʀɪᴏʀɪᴛʏ Sᴜᴘᴘᴏʀᴛ`;
  }

  // ==================================================
  // OWNER SECTION
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
├ ✅ /approve ID
└ ❌ /reject ID

💳 Pᴀʏᴍᴇɴᴛs

├ 💰 /payments
└ 🔎 /paymentinfo ID

👥 Uѕᴇʀ Mᴀɴᴀɢᴇᴍᴇɴᴛ

├ 👥 /users
├ 🔎 /userinfo ID
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

⚠️ Aʟʟ Sᴇʀᴠɪᴄᴇ Rᴇǫᴜᴇsᴛs Rᴇǫᴜɪʀᴇ
👑 Oᴡɴᴇʀ Rᴇᴠɪᴇᴡ & Aᴘᴘʀᴏᴠᴀʟ.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  return menu;
}

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  getStartMenu
};




