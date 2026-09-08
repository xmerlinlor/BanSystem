const { Markup } = require("telegraf");

function startButtons() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("📱 WʜᴀᴛsAᴘᴘ Bᴀɴ", "whatsapp_ban"),
      Markup.button.callback("🔓 WʜᴀᴛsAᴘᴘ Uɴʙᴀɴ", "whatsapp_unban")
    ],
    [
      Markup.button.callback("👥 Gʀᴏᴜᴘ Bᴀɴ", "whatsapp_group_ban"),
      Markup.button.callback("🔓 Gʀᴏᴜᴘ Uɴʙᴀɴ", "whatsapp_group_unban")
    ],
    [
      Markup.button.callback("📢 Cʜᴀɴɴᴇʟ Bᴀɴ", "whatsapp_channel_ban"),
      Markup.button.callback("🔓 Cʜᴀɴɴᴇʟ Uɴʙᴀɴ", "whatsapp_channel_unban")
    ],
    [
      Markup.button.callback("✈️ Tᴇʟᴇɢʀᴀᴍ Bᴀɴ", "telegram_ban"),
      Markup.button.callback("🔓 Tᴇʟᴇɢʀᴀᴍ Uɴʙᴀɴ", "telegram_unban")
    ],
    [
      Markup.button.callback("👥 Gʀᴏᴜᴘ Bᴀɴ", "telegram_group_ban"),
      Markup.button.callback("🔓 Gʀᴏᴜᴘ Uɴʙᴀɴ", "telegram_group_unban")
    ],
    [
      Markup.button.callback("📢 Cʜᴀɴɴᴇʟ Bᴀɴ", "telegram_channel_ban"),
      Markup.button.callback("🔓 Cʜᴀɴɴᴇʟ Uɴʙᴀɴ", "telegram_channel_unban")
    ],
    [
      Markup.button.callback("🤖 Bᴀɴ Tᴇʟᴇɢʀᴀᴍ Bᴏᴛ", "telegram_bot_ban")
    ],
    [
      Markup.button.callback("💳 Pᴀʏᴍᴇɴᴛ", "payment"),
      Markup.button.callback("🎁 Rᴇғᴇʀʀᴀʟ", "referral")
    ],
    [
      Markup.button.callback("📩 Mʏ Rᴇǫᴜᴇsᴛs", "my_requests")
    ],
    [
      Markup.button.callback("👑 Aᴅᴍɪɴ Pᴀɴᴇʟ", "admin_panel"),
      Markup.button.callback("⚡ Oᴡɴᴇʀ Pᴀɴᴇʟ", "owner_panel")
    ]
  ]);
}

module.exports = {
  startButtons
};
