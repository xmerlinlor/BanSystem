// telegram/menu.js

const config = require("../config");
const {
  getUser
} = require("../database/database");

// ==================================================
// GET PREMIUM STATUS
// ==================================================

function isPremiumUser(userId) {
  try {
    const user = getUser(String(userId));

    return !!(
      user &&
      (
        user.premium === true ||
        user.isPremium === true
      )
    );
  } catch (error) {
    console.error(
      "❌ Premium status error:",
      error.message
    );

    return false;
  }
}

// ==================================================
// GET START MENU
// ==================================================

function getStartMenu(ctx) {
  const telegramUser = ctx?.from || {};

  const userId = String(
    telegramUser.id || ""
  );

  const username = telegramUser.username
    ? `@${telegramUser.username}`
    : telegramUser.first_name || "User";

  const ownerIds = Array.isArray(
    config.ownerIds
  )
    ? config.ownerIds.map(String)
    : [];

  const isOwner =
    ownerIds.includes(userId);

  const isPremium =
    isPremiumUser(userId);

  // ==================================================
  // USER MENU
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

👤 Uѕᴇʀ Bᴀɴ: ₦${config.prices.userBan}
🔓 Uѕᴇʀ Uɴʙᴀɴ: ₦${config.prices.userUnban}

👥 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Bᴀɴ: ₦${config.prices.groupChannelBan}
🔓 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Uɴʙᴀɴ: ₦${config.prices.groupChannelUnban}

🎁 Rᴇғᴇʀʀᴀʟ Rᴇᴡᴀʀᴅ: ₦${config.referral.reward}

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
  // PREMIUM USER
  // ==================================================

  if (isPremium) {
    menu += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 Pʀᴇᴍɪᴜᴍ Aᴄᴄᴇss

├ 💎 Pʀᴇᴍɪᴜᴍ Aᴄᴄᴇss: Aᴄᴛɪᴠᴇ
├ ⚡ Fᴀsᴛ Rᴇǫᴜᴇsᴛ Pʀᴏᴄᴇssɪɴɢ
└ 👑 Pʀᴇᴍɪᴜᴍ Uѕᴇʀ Sᴜᴘᴘᴏʀᴛ`;
  }

  // ==================================================
  // OWNER MENU
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
  getStartMenu,
  isPremiumUser
};
