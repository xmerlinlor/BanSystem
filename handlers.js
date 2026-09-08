const { Markup } = require("telegraf");
const config = require("../config");
const { startButtons } = require("./buttons");
const { getStartMenu } = require("./menus");

const {
  getRequest,
  saveRequest,
  getUserRequests,
  getPendingRequests,
  savePayment,
  addLog,
  saveUser,
  readDatabase
} = require("../database/database");

const {
  checkForceJoin,
  forceJoinKeyboard
} = require("../utils/forceJoin");

// ============================================
// TEMPORARY USER STATES
// ============================================

const userStates = new Map();

// ============================================
// SERVICES
// ============================================

const services = {
  whatsapp_ban: {
    name: "📱 WʜᴀᴛsAᴘᴘ Uѕᴇʀ Bᴀɴ",
    price: config.prices.userBan,
    type: "ban",
    platform: "WhatsApp",
    targetType: "user"
  },

  whatsapp_unban: {
    name: "📱 WʜᴀᴛsAᴘᴘ Uѕᴇʀ Uɴʙᴀɴ",
    price: config.prices.userUnban,
    type: "unban",
    platform: "WhatsApp",
    targetType: "user"
  },

  whatsapp_group_ban: {
    name: "👥 WʜᴀᴛsAᴘᴘ Gʀᴏᴜᴘ Bᴀɴ",
    price: config.prices.groupChannelBan,
    type: "ban",
    platform: "WhatsApp",
    targetType: "group"
  },

  whatsapp_group_unban: {
    name: "👥 WʜᴀᴛsAᴘᴘ Gʀᴏᴜᴘ Uɴʙᴀɴ",
    price: config.prices.groupChannelUnban,
    type: "unban",
    platform: "WhatsApp",
    targetType: "group"
  },

  whatsapp_channel_ban: {
    name: "📢 WʜᴀᴛsAᴘᴘ Cʜᴀɴɴᴇʟ Bᴀɴ",
    price: config.prices.groupChannelBan,
    type: "ban",
    platform: "WhatsApp",
    targetType: "channel"
  },

  whatsapp_channel_unban: {
    name: "📢 WʜᴀᴛsAᴘᴘ Cʜᴀɴɴᴇʟ Uɴʙᴀɴ",
    price: config.prices.groupChannelUnban,
    type: "unban",
    platform: "WhatsApp",
    targetType: "channel"
  },

  telegram_ban: {
    name: "✈️ Tᴇʟᴇɢʀᴀᴍ Uѕᴇʀ Bᴀɴ",
    price: config.prices.userBan,
    type: "ban",
    platform: "Telegram",
    targetType: "user"
  },

  telegram_unban: {
    name: "✈️ Tᴇʟᴇɢʀᴀᴍ Uѕᴇʀ Uɴʙᴀɴ",
    price: config.prices.userUnban,
    type: "unban",
    platform: "Telegram",
    targetType: "user"
  },

  telegram_group_ban: {
    name: "👥 Tᴇʟᴇɢʀᴀᴍ Gʀᴏᴜᴘ Bᴀɴ",
    price: config.prices.groupChannelBan,
    type: "ban",
    platform: "Telegram",
    targetType: "group"
  },

  telegram_group_unban: {
    name: "👥 Tᴇʟᴇɢʀᴀᴍ Gʀᴏᴜᴘ Uɴʙᴀɴ",
    price: config.prices.groupChannelUnban,
    type: "unban",
    platform: "Telegram",
    targetType: "group"
  },

  telegram_channel_ban: {
    name: "📢 Tᴇʟᴇɢʀᴀᴍ Cʜᴀɴɴᴇʟ Bᴀɴ",
    price: config.prices.groupChannelBan,
    type: "ban",
    platform: "Telegram",
    targetType: "channel"
  },

  telegram_channel_unban: {
    name: "📢 Tᴇʟᴇɢʀᴀᴍ Cʜᴀɴɴᴇʟ Uɴʙᴀɴ",
    price: config.prices.groupChannelUnban,
    type: "unban",
    platform: "Telegram",
    targetType: "channel"
  },

  telegram_bot_ban: {
    name: "🤖 Tᴇʟᴇɢʀᴀᴍ Bᴏᴛ Bᴀɴ",
    price: config.prices.userBan,
    type: "ban",
    platform: "Telegram",
    targetType: "bot"
  }
};

// ============================================
// HELPERS
// ============================================

function formatPrice(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function isOwner(userId) {
  return config.ownerIds.includes(String(userId));
}

function createRequestId() {
  return `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getUserName(ctx) {
  if (ctx.from?.username) {
    return `@${ctx.from.username}`;
  }

  return ctx.from?.first_name || "User";
}

function getService(serviceId) {
  return services[serviceId] || null;
}

// ============================================
// FORCE JOIN
// ============================================

async function requireForceJoin(ctx) {
  if (isOwner(ctx.from.id)) {
    return true;
  }

  const result = await checkForceJoin(ctx.telegram, ctx.from.id);

  if (result.joined) {
    return true;
  }

  await ctx.reply(
    `╭━━━〔 🛡️ Fᴏʀᴄᴇ Jᴏɪɴ 〕━━━╮

⚠️ Yᴏᴜ ᴍᴜsᴛ ᴊᴏɪɴ ᴏᴜʀ ᴄʜᴀɴɴᴇʟs
ʙᴇғᴏʀᴇ ᴜsɪɴɢ Bᴀɴ Sʏsᴛᴇᴍ.

📢 Jᴏɪɴ ᴀʟʟ ʀᴇǫᴜɪʀᴇᴅ ᴄʜᴀɴɴᴇʟs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aғᴛᴇʀ ᴊᴏɪɴɪɴɢ, ᴛᴀᴘ:
✅ Cʜᴇᴄᴋ Aɢᴀɪɴ

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
    {
      reply_markup: forceJoinKeyboard(result.notJoined)
    }
  );

  return false;
}

// ============================================
// SERVICE PROMPTS
// ============================================

function getServicePrompt(service) {
  if (service.targetType === "user") {
    if (service.platform === "WhatsApp") {
      return service.type === "ban"
        ? "📱 Sᴇɴᴅ WʜᴀᴛsAᴘᴘ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ.\n\nExample:\n234xxxxxxxxx"
        : "📱 Sᴇɴᴅ WʜᴀᴛsAᴘᴘ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ ᴛᴏ ᴜɴʙᴀɴ.\n\nExample:\n234xxxxxxxxx";
    }

    if (service.platform === "Telegram") {
      return service.type === "ban"
        ? "✈️ Sᴇɴᴅ Tᴇʟᴇɢʀᴀᴍ Uѕᴇʀ ID.\n\nExample:\n123456789"
        : "✈️ Sᴇɴᴅ Tᴇʟᴇɢʀᴀᴍ Uѕᴇʀ ID ᴛᴏ ᴜɴʙᴀɴ.\n\nExample:\n123456789";
    }
  }

  if (service.targetType === "group") {
    if (service.platform === "WhatsApp") {
      return "👥 Sᴇɴᴅ WʜᴀᴛsAᴘᴘ Gʀᴏᴜᴘ Lɪɴᴋ.\n\nExample:\nhttps://chat.whatsapp.com/xxxxx";
    }

    return "👥 Sᴇɴᴅ Tᴇʟᴇɢʀᴀᴍ Gʀᴏᴜᴘ ID.\n\nExample:\n-1001234567890";
  }

  if (service.targetType === "channel") {
    if (service.platform === "WhatsApp") {
      return "📢 Sᴇɴᴅ WʜᴀᴛsAᴘᴘ Cʜᴀɴɴᴇʟ Lɪɴᴋ.\n\nExample:\nhttps://whatsapp.com/channel/xxxxx";
    }

    return "📢 Sᴇɴᴅ Tᴇʟᴇɢʀᴀᴍ Cʜᴀɴɴᴇʟ ID.\n\nExample:\n-1009876543210";
  }

  return "🤖 Sᴇɴᴅ Tᴇʟᴇɢʀᴀᴍ Bᴏᴛ Uѕᴇʀɴᴀᴍᴇ.\n\nExample:\n@ExampleBot";
}

function getReasonPrompt(service) {
  if (service.type === "ban") {
    return "📝 Sᴇɴᴅ ᴛʜᴇ ʀᴇᴀsᴏɴ ғᴏʀ ᴛʜɪs ʙᴀɴ.";
  }

  return "📝 Sᴇɴᴅ ᴛʜᴇ ʀᴇᴀsᴏɴ ғᴏʀ ᴛʜɪs ᴜɴʙᴀɴ.";
}

// ============================================
// PAYMENT MESSAGE
// ============================================

function paymentMessage(request) {
  return `╭━━━〔 💳 Pᴀʏᴍᴇɴᴛ 〕━━━╮

🆔 Rᴇǫᴜᴇsᴛ: ${request.id}

🛡️ Sᴇʀᴠɪᴄᴇ:
${request.service.name}

🎯 Tᴀʀɢᴇᴛ:
${request.target}

💰 Aᴍᴏᴜɴᴛ:
${formatPrice(request.price)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏦 Bᴀɴᴋ: ${config.payment.bankName}
💳 Aᴄᴄᴏᴜɴᴛ: ${config.payment.accountNumber}
👤 Nᴀᴍᴇ: ${config.payment.accountName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 Mᴀᴋᴇ ᴛʜᴇ ᴘᴀʏᴍᴇɴᴛ.

Tʜᴇɴ ᴛᴀᴘ:
📸 Pᴀʏᴍᴇɴᴛ Sᴇɴᴛ

Yᴏᴜ ᴡɪʟʟ ᴛʜᴇɴ ʙᴇ ᴀsᴋᴇᴅ ғᴏʀ ʏᴏᴜʀ
ᴘᴀʏᴍᴇɴᴛ sᴄʀᴇᴇɴsʜᴏᴛ.

⏳ Sᴛᴀᴛᴜs: Pᴀʏᴍᴇɴᴛ Pᴇɴᴅɪɴɢ

╰━━━━━━━━━━━━━━━━━━━━╯`;
}

// ============================================
// OWNER REQUEST MESSAGE
// ============================================

function ownerRequestMessage(request) {
  const proof = request.paymentProof
    ? "📸 Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ: Aᴛᴛᴀᴄʜᴇᴅ"
    : "📸 Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ: Nᴏᴛ Aᴛᴛᴀᴄʜᴇᴅ";

  return `╭━━━〔 📩 Nᴇᴡ Rᴇǫᴜᴇsᴛ 〕━━━╮

🆔 Rᴇǫᴜᴇsᴛ:
${request.id}

👤 Uѕᴇʀ:
${request.username}

🆔 Uѕᴇʀ ID:
${request.userId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ Sᴇʀᴠɪᴄᴇ:
${request.service.name}

🌐 Pʟᴀᴛғᴏʀᴍ:
${request.service.platform}

🎯 Tʏᴘᴇ:
${request.service.targetType}

⚡ Aᴄᴛɪᴏɴ:
${request.service.type.toUpperCase()}

🎯 Tᴀʀɢᴇᴛ:
${request.target}

📝 Rᴇᴀsᴏɴ:
${request.reason}

💰 Pᴀʏᴍᴇɴᴛ:
${formatPrice(request.price)}

${proof}

⏳ Sᴛᴀᴛᴜs:
PENDING OWNER APPROVAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👑 Oᴡɴᴇʀ Rᴇᴠɪᴇᴡ Rᴇǫᴜɪʀᴇᴅ.

╰━━━━━━━━━━━━━━━━━━━━╯`;
}

// ============================================
// REGISTER HANDLERS
// ============================================

function registerHandlers(bot) {

  // ==========================================
  // START
  // ==========================================

  bot.start(async (ctx) => {
    try {
      if (!(await requireForceJoin(ctx))) {
        return;
      }

      saveUser(ctx.from.id, {
        username: ctx.from.username || null,
        firstName: ctx.from.first_name || null,
        lastName: ctx.from.last_name || null
      });

      await ctx.reply(
        getStartMenu(ctx),
        startButtons()
      );
    } catch (error) {
      console.error("❌ Start error:", error);
      await ctx.reply("❌ Aɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ.");
    }
  });

  // ==========================================
  // CHECK FORCE JOIN
  // ==========================================

  bot.action("check_force_join", async (ctx) => {
    await ctx.answerCbQuery();

    const joined = await requireForceJoin(ctx);

    if (joined) {
      await ctx.reply(
        `╭━━━〔 ✅ Fᴏʀᴄᴇ Jᴏɪɴ 〕━━━╮

✅ Yᴏᴜ ʜᴀᴠᴇ ᴊᴏɪɴᴇᴅ ᴀʟʟ ʀᴇǫᴜɪʀᴇᴅ ᴄʜᴀɴɴᴇʟs.

🛡️ Bᴀɴ Sʏsᴛᴇᴍ ɪs ɴᴏᴡ ᴀᴠᴀɪʟᴀʙʟᴇ.

╰━━━━━━━━━━━━━━━━━━━━╯`,
        startButtons()
      );
    }
  });

  // ==========================================
  // PAYMENT
  // ==========================================

  bot.action("payment", async (ctx) => {
    await ctx.answerCbQuery();

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    await ctx.reply(
      `╭━━━〔 💳 Pᴀʏᴍᴇɴᴛ 〕━━━╮

🏦 Bᴀɴᴋ: ${config.payment.bankName}
💳 Aᴄᴄᴏᴜɴᴛ: ${config.payment.accountNumber}
👤 Nᴀᴍᴇ: ${config.payment.accountName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Sᴇʀᴠɪᴄᴇ Pʀɪᴄᴇs:

👤 Uѕᴇʀ Bᴀɴ:
${formatPrice(config.prices.userBan)}

👤 Uѕᴇʀ Uɴʙᴀɴ:
${formatPrice(config.prices.userUnban)}

👥 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Bᴀɴ:
${formatPrice(config.prices.groupChannelBan)}

👥 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Uɴʙᴀɴ:
${formatPrice(config.prices.groupChannelUnban)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Pᴀʏᴍᴇɴᴛ ᴘʀᴏᴏғ ɪs ʀᴇǫᴜɪʀᴇᴅ.

╰━━━━━━━━━━━━━━━━━━━━╯`
    );
  });

  // ==========================================
  // REFERRAL
  // ==========================================

  bot.action("referral", async (ctx) => {
    await ctx.answerCbQuery();

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    const referralLink =
      `https://t.me/${ctx.botInfo?.username || "YourBot"}?start=ref_${ctx.from.id}`;

    await ctx.reply(
      `╭━━━〔 🎁 Rᴇғᴇʀʀᴀʟ 〕━━━╮

💰 Rᴇᴡᴀʀᴅ:
${formatPrice(config.referral.reward)}

🎁 Eᴀʀɴ ${formatPrice(config.referral.reward)}
sᴇʀᴠɪᴄᴇ ᴄʀᴇᴅɪᴛ ғᴏʀ ᴇᴀᴄʜ
sᴜᴄᴄᴇssғᴜʟ ʀᴇғᴇʀʀᴀʟ.

🔗 Yᴏᴜʀ Rᴇғᴇʀʀᴀʟ Lɪɴᴋ:

${referralLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Rᴇғᴇʀʀᴀʟ ᴄʀᴇᴅɪᴛ ɪs ᴀᴘᴘʟɪᴇᴅ
ᴀғᴛᴇʀ ᴠᴀʟɪᴅᴀᴛɪᴏɴ.

╰━━━━━━━━━━━━━━━━━━━━╯`
    );
  });

  // ==========================================
  // MY REQUESTS
  // ==========================================

  bot.action("my_requests", async (ctx) => {
    await ctx.answerCbQuery();

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    const requests = getUserRequests(ctx.from.id);

    if (!requests.length) {
      return ctx.reply(
        "📩 Yᴏᴜ ʜᴀᴠᴇ ɴᴏ ʀᴇǫᴜᴇsᴛs ʏᴇᴛ."
      );
    }

    let text =
      "╭━━━〔 📩 Mʏ Rᴇǫᴜᴇsᴛs 〕━━━╮\n\n";

    for (const request of requests) {
      text +=
        `🆔 ${request.id}\n` +
        `🛡️ ${request.service?.name || "Unknown Service"}\n` +
        `🎯 ${request.target || "N/A"}\n` +
        `💰 ${formatPrice(request.price || 0)}\n` +
        `⏳ ${request.status}\n` +
        `🕒 ${request.createdAt || request.updatedAt}\n\n`;
    }

    text += "╰━━━━━━━━━━━━━━━━━━━━╯";

    await ctx.reply(text);
  });

  // ==========================================
  // OWNER PANEL
  // ==========================================

  bot.action("owner_panel", async (ctx) => {
    await ctx.answerCbQuery();

    if (!isOwner(ctx.from.id)) {
      return ctx.reply("❌ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ.");
    }

    await ctx.reply(
      `╭━━━〔 ⚡ Oᴡɴᴇʀ Pᴀɴᴇʟ 〕━━━╮

💳 Pᴀʏᴍᴇɴᴛ Mᴀɴᴀɢᴇᴍᴇɴᴛ
📩 Rᴇǫᴜᴇsᴛ Rᴇᴠɪᴇᴡ
💎 Pʀᴇᴍɪᴜᴍ Mᴀɴᴀɢᴇᴍᴇɴᴛ
👥 Uѕᴇʀ Mᴀɴᴀɢᴇᴍᴇɴᴛ
🛡️ Bᴀɴ Sʏsᴛᴇᴍ Cᴏɴᴛʀᴏʟ
📊 Sʏsᴛᴇᴍ Sᴛᴀᴛᴜs
📋 Aᴄᴛɪᴠɪᴛʏ Lᴏɢs
⚙️ Sʏsᴛᴇᴍ Sᴇᴛᴛɪɴɢs

╰━━━━━━━━━━━━━━━━━━━━╯`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "📩 Pᴇɴᴅɪɴɢ Rᴇǫᴜᴇsᴛs",
            "owner_requests"
          )
        ],
        [
          Markup.button.callback(
            "📊 Sʏsᴛᴇᴍ Sᴛᴀᴛᴜs",
            "system_status"
          )
        ]
      ])
    );
  });

  // ==========================================
  // ADMIN PANEL
  // ==========================================

  bot.action("admin_panel", async (ctx) => {
    await ctx.answerCbQuery();

    if (!isOwner(ctx.from.id)) {
      return ctx.reply("❌ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ.");
    }

    await ctx.reply(
      `╭━━━〔 👑 Aᴅᴍɪɴ Pᴀɴᴇʟ 〕━━━╮

⚙️ Aᴅᴍɪɴ ғᴇᴀᴛᴜʀᴇs ᴀʀᴇ
ʙᴇɪɴɢ ᴄᴏɴɴᴇᴄᴛᴇᴅ.

╰━━━━━━━━━━━━━━━━━━━━╯`
    );
  });

  // ==========================================
  // SERVICE SELECTION
  // ==========================================

  for (const [serviceId, service] of Object.entries(services)) {

    bot.action(serviceId, async (ctx) => {
      await ctx.answerCbQuery();

      if (!(await requireForceJoin(ctx))) {
        return;
      }

      if (config.settings.maintenance) {
        return ctx.reply(
          "⚠️ Bᴀɴ Sʏsᴛᴇᴍ ɪs ᴄᴜʀʀᴇɴᴛʟʏ ᴜɴᴅᴇʀ ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ."
        );
      }

      const requestId = createRequestId();

      userStates.set(String(ctx.from.id), {
        step: "target",
        serviceId,
        requestId
      });

      await ctx.reply(
        `╭━━━〔 🛡️ Sᴇʀᴠɪᴄᴇ Rᴇǫᴜᴇsᴛ 〕━━━╮

🛡️ Sᴇʀᴠɪᴄᴇ:
${service.name}

💰 Pʀɪᴄᴇ:
${formatPrice(service.price)}

🆔 Rᴇǫᴜᴇsᴛ ID:
${requestId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${getServicePrompt(service)}

╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    });
  }

  // ==========================================
  // TEXT INPUT
  // ==========================================

  bot.on("text", async (ctx) => {
    const userId = String(ctx.from.id);
    const state = userStates.get(userId);

    if (!state) {
      return;
    }

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    const service = getService(state.serviceId);

    if (!service) {
      userStates.delete(userId);
      return ctx.reply("❌ Sᴇʀᴠɪᴄᴇ ɴᴏᴛ ғᴏᴜɴᴅ.");
    }

    const text = ctx.message.text.trim();

    if (!text) {
      return ctx.reply("❌ Pʟᴇᴀsᴇ sᴇɴᴅ ᴀ ᴠᴀʟɪᴅ ᴠᴀʟᴜᴇ.");
    }

    // TARGET
    if (state.step === "target") {
      state.target = text;
      state.step = "reason";

      userStates.set(userId, state);

      return ctx.reply(
        getReasonPrompt(service)
      );
    }

    // REASON
    if (state.step === "reason") {
      state.reason = text;

      const request = {
        id: state.requestId,
        userId,
        username: getUserName(ctx),

        service,

        target: state.target,
        reason: state.reason,

        price: service.price,

        status: "PAYMENT_PENDING",

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveRequest(request.id, request);

      saveUser(userId, {
        username: ctx.from.username || null,
        firstName: ctx.from.first_name || null,
        lastName: ctx.from.last_name || null
      });

      addLog({
        action: "REQUEST_CREATED",
        requestId: request.id,
        userId,
        service: service.name,
        status: request.status
      });

      userStates.delete(userId);

      await ctx.reply(
        paymentMessage(request),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "📸 Pᴀʏᴍᴇɴᴛ Sᴇɴᴛ",
              `payment_sent:${request.id}`
            )
          ],
          [
            Markup.button.callback(
              "❌ Cᴀɴᴄᴇʟ",
              `cancel_request:${request.id}`
            )
          ]
        ])
      );
    }
  });

  // ==========================================
  // PAYMENT SENT
  // ==========================================

  bot.action(/^payment_sent:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    const requestId = ctx.match[1];
    const request = getRequest(requestId);

    if (!request) {
      return ctx.reply("❌ Rᴇǫᴜᴇsᴛ ɴᴏᴛ ғᴏᴜɴᴅ.");
    }

    if (request.userId !== String(ctx.from.id)) {
      return ctx.reply(
        "❌ Tʜɪs ʀᴇǫᴜᴇsᴛ ᴅᴏᴇs ɴᴏᴛ ʙᴇʟᴏɴɢ ᴛᴏ ʏᴏᴜ."
      );
    }

    if (
      ![
        "PAYMENT_PENDING",
        "PAYMENT_PROOF_PENDING"
      ].includes(request.status)
    ) {
      return ctx.reply(
        `⚠️ Tʜɪs ʀᴇǫᴜᴇsᴛ ɪs ᴀʟʀᴇᴀᴅʏ ${request.status}.`
      );
    }

    request.status = "PAYMENT_PROOF_PENDING";
    request.paymentMarkedAt = new Date().toISOString();

    saveRequest(request.id, request);

    savePayment(request.id, {
      requestId: request.id,
      userId: request.userId,
      amount: request.price,
      status: "PROOF_PENDING",
      markedAt: request.paymentMarkedAt
    });

    addLog({
      action: "PAYMENT_MARKED_SENT",
      requestId: request.id,
      userId: request.userId,
      status: request.status
    });

    await ctx.reply(
      `╭━━━〔 📸 Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ 〕━━━╮

🆔 Rᴇǫᴜᴇsᴛ:
${request.id}

💰 Aᴍᴏᴜɴᴛ:
${formatPrice(request.price)}

📸 Sᴇɴᴅ ʏᴏᴜʀ ᴘᴀʏᴍᴇɴᴛ
sᴄʀᴇᴇɴsʜᴏᴛ ɴᴏᴡ.

⏳ Sᴛᴀᴛᴜs:
Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ Pᴇɴᴅɪɴɢ

╰━━━━━━━━━━━━━━━━━━━━╯`
    );
  });

  // ==========================================
  // PAYMENT PROOF PHOTO
  // ==========================================

  bot.on("photo", async (ctx) => {
    const userId = String(ctx.from.id);
    const requestList = getUserRequests(userId);

    const request = requestList
      .filter((item) => item.status === "PAYMENT_PROOF_PENDING")
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )[0];

    if (!request) {
      return;
    }

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    const photos = ctx.message.photo;

    if (!photos || !photos.length) {
      return ctx.reply(
        "❌ Pᴀʏᴍᴇɴᴛ ᴘʀᴏᴏғ ᴘʜᴏᴛᴏ ɴᴏᴛ ғᴏᴜɴᴅ."
      );
    }

    const largestPhoto = photos[photos.length - 1];

    request.paymentProof = {
      fileId: largestPhoto.file_id,
      fileUniqueId: largestPhoto.file_unique_id,
      caption: ctx.message.caption || null,
      submittedAt: new Date().toISOString()
    };

    request.status = "PENDING_OWNER_APPROVAL";
    request.paymentProofAt = new Date().toISOString();

    saveRequest(request.id, request);

    savePayment(request.id, {
      requestId: request.id,
      userId: request.userId,
      amount: request.price,
      status: "PROOF_SUBMITTED",
      proofFileId: largestPhoto.file_id,
      submittedAt: request.paymentProofAt
    });

    addLog({
      action: "PAYMENT_PROOF_SUBMITTED",
      requestId: request.id,
      userId: request.userId,
      status: request.status
    });

    await ctx.reply(
      `╭━━━〔 ✅ Rᴇǫᴜᴇsᴛ Sᴜʙᴍɪᴛᴛᴇᴅ 〕━━━╮

🆔 Rᴇǫᴜᴇsᴛ:
${request.id}

📸 Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ:
Rᴇᴄᴇɪᴠᴇᴅ

⏳ Sᴛᴀᴛᴜs:
Pᴇɴᴅɪɴɢ Oᴡɴᴇʀ Aᴘᴘʀᴏᴠᴀʟ

👑 Aɴ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴏᴡɴᴇʀ
ᴡɪʟʟ ʀᴇᴠɪᴇᴡ ʏᴏᴜʀ ʀᴇǫᴜᴇsᴛ.

╰━━━━━━━━━━━━━━━━━━━━╯`
    );

    // Notify both configured owners.
    for (const ownerId of config.ownerIds) {
      try {
        await ctx.telegram.sendPhoto(
          ownerId,
          largestPhoto.file_id,
          {
            caption: ownerRequestMessage(request),
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  "✅ Aᴘᴘʀᴏᴠᴇ",
                  `approve_request:${request.id}`
                ),
                Markup.button.callback(
                  "❌ Rᴇᴊᴇᴄᴛ",
                  `reject_request:${request.id}`
                )
              ]
            ]).reply_markup
          }
        );
      } catch (error) {
        console.error(
          `❌ Could not notify owner ${ownerId}:`,
          error.message
        );
      }
    }
  });

  // ==========================================
  // CANCEL REQUEST
  // ==========================================

  bot.action(/^cancel_request:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    if (!(await requireForceJoin(ctx))) {
      return;
    }

    const requestId = ctx.match[1];
    const request = getRequest(requestId);

    if (!request) {
      return ctx.reply("❌ Rᴇǫᴜᴇsᴛ ɴᴏᴛ ғᴏᴜɴᴅ.");
    }

    if (request.userId !== String(ctx.from.id)) {
      return ctx.reply(
        "❌ Tʜɪs ʀᴇǫᴜᴇsᴛ ᴅᴏᴇs ɴᴏᴛ ʙᴇʟᴏɴɢ ᴛᴏ ʏᴏᴜ."
      );
    }

    request.status = "CANCELLED";
    request.cancelledAt = new Date().toISOString();

    saveRequest(request.id, request);

    addLog({
      action: "REQUEST_CANCELLED",
      requestId: request.id,
      userId: request.userId,
      status: request.status
    });

    await ctx.reply(
      `❌ Rᴇǫᴜᴇsᴛ Cᴀɴᴄᴇʟʟᴇᴅ.

🆔 ${request.id}

⏳ Sᴛᴀᴛᴜs:
CANCELLED`
    );
  });

  // ==========================================
  // OWNER REQUESTS
  // ==========================================

  bot.action("owner_requests", async (ctx) => {
    await ctx.answerCbQuery();

    if (!isOwner(ctx.from.id)) {
      return ctx.reply("❌ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ.");
    }

    const requests = getPendingRequests();

    if (!requests.length) {
      return ctx.reply(
        "📭 Nᴏ Pᴇɴᴅɪɴɢ Rᴇǫᴜᴇsᴛs."
      );
    }

    for (const request of requests) {

      if (request.status === "PAYMENT_PENDING") {
        await ctx.reply(
          ownerRequestMessage(request),
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "❌ Rᴇᴊᴇᴄᴛ",
                `reject_request:${request.id}`
              )
            ]
          ])
        );

        continue;
      }

      if (
        request.status === "PAYMENT_PROOF_PENDING"
      ) {
        await ctx.reply(
          ownerRequestMessage(request),
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "❌ Rᴇᴊᴇᴄᴛ",
                `reject_request:${request.id}`
              )
            ]
          ])
        );

        continue;
      }

      await ctx.reply(
        ownerRequestMessage(request),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "✅ Aᴘᴘʀᴏᴠᴇ",
              `approve_request:${request.id}`
            ),
            Markup.button.callback(
              "❌ Rᴇᴊᴇᴄᴛ",
              `reject_request:${request.id}`
            )
          ]
        ])
      );
    }
  });

  // ==========================================
  // OWNER APPROVE
  // ==========================================

  bot.action(/^approve_request:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    if (!isOwner(ctx.from.id)) {
      return ctx.reply(
        "❌ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ."
      );
    }

    const requestId = ctx.match[1];
    const request = getRequest(requestId);

    if (!request) {
      return ctx.reply(
        "❌ Rᴇǫᴜᴇsᴛ ɴᴏᴛ ғᴏᴜɴᴅ."
      );
    }

    if (request.status !== "PENDING_OWNER_APPROVAL") {
      return ctx.reply(
        `⚠️ Rᴇǫᴜᴇsᴛ ɪs ɴᴏᴛ ʀᴇᴀᴅʏ ғᴏʀ ᴀᴘᴘʀᴏᴠᴀʟ.\n\nSᴛᴀᴛᴜs: ${request.status}`
      );
    }

    request.status = "APPROVED";
    request.approvedBy = String(ctx.from.id);
    request.approvedAt = new Date().toISOString();

    saveRequest(request.id, request);

    savePayment(request.id, {
      requestId: request.id,
      status: "APPROVED"
    });

    addLog({
      action: "REQUEST_APPROVED",
      requestId: request.id,
      userId: request.userId,
      ownerId: String(ctx.from.id),
      status: request.status
    });

    await ctx.reply(
      `╭━━━〔 ✅ Rᴇǫᴜᴇsᴛ Aᴘᴘʀᴏᴠᴇᴅ 〕━━━╮

🆔 ${request.id}

🛡️ ${request.service.name}

👑 Aᴘᴘʀᴏᴠᴇᴅ Bʏ:
${String(ctx.from.id)}

⏳ Sᴛᴀᴛᴜs:
Aᴘᴘʀᴏᴠᴇᴅ

⚙️ Rᴇᴀᴅʏ ғᴏʀ sᴇʀᴠɪᴄᴇ
ᴇxᴇᴄᴜᴛɪᴏɴ.

╰━━━━━━━━━━━━━━━━━━━━╯`
    );

    try {
      await ctx.telegram.sendMessage(
        request.userId,
        `╭━━━〔 ✅ Rᴇǫᴜᴇsᴛ Aᴘᴘʀᴏᴠᴇᴅ 〕━━━╮

🆔 ${request.id}

🛡️ ${request.service.name}

⏳ Sᴛᴀᴛᴜs:
Aᴘᴘʀᴏᴠᴇᴅ

👑 Yᴏᴜʀ ʀᴇǫᴜᴇsᴛ ʜᴀs ʙᴇᴇɴ
ᴀᴘᴘʀᴏᴠᴇᴅ ʙʏ ᴀɴ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴏᴡɴᴇʀ.

╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    } catch (error) {
      console.error(
        "❌ Could not notify user:",
        error.message
      );
    }
  });

  // ==========================================
  // OWNER REJECT
  // ==========================================

  bot.action(/^reject_request:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    if (!isOwner(ctx.from.id)) {
      return ctx.reply(
        "❌ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ."
      );
    }

    const requestId = ctx.match[1];
    const request = getRequest(requestId);

    if (!request) {
      return ctx.reply(
        "❌ Rᴇǫᴜᴇsᴛ ɴᴏᴛ ғᴏᴜɴᴅ."
      );
    }

    if (
      ["APPROVED", "REJECTED", "CANCELLED"]
        .includes(request.status)
    ) {
      return ctx.reply(
        `⚠️ Rᴇǫᴜᴇsᴛ ɪs ᴀʟʀᴇᴀᴅʏ ${request.status}.`
      );
    }

    request.status = "REJECTED";
    request.rejectedBy = String(ctx.from.id);
    request.rejectedAt = new Date().toISOString();

    saveRequest(request.id, request);

    savePayment(request.id, {
      requestId: request.id,
      status: "REJECTED"
    });

    addLog({
      action: "REQUEST_REJECTED",
      requestId: request.id,
      userId: request.userId,
      ownerId: String(ctx.from.id),
      status: request.status
    });

    await ctx.reply(
      `╭━━━〔 ❌ Rᴇǫᴜᴇsᴛ Rᴇᴊᴇᴄᴛᴇᴅ 〕━━━╮

🆔 ${request.id}

🛡️ ${request.service.name}

👑 Rᴇᴊᴇᴄᴛᴇᴅ Bʏ:
${String(ctx.from.id)}

⏳ Sᴛᴀᴛᴜs:
Rᴇᴊᴇᴄᴛᴇᴅ

╰━━━━━━━━━━━━━━━━━━━━╯`
    );

    try {
      await ctx.telegram.sendMessage(
        request.userId,
        `╭━━━〔 ❌ Rᴇǫᴜᴇsᴛ Rᴇᴊᴇᴄᴛᴇᴅ 〕━━━╮

🆔 ${request.id}

🛡️ ${request.service.name}

⏳ Sᴛᴀᴛᴜs:
Rᴇᴊᴇᴄᴛᴇᴅ

📩 Pʟᴇᴀsᴇ ᴄᴏɴᴛᴀᴄᴛ ᴛʜᴇ ᴏᴡɴᴇʀ
ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏʀᴍᴀᴛɪᴏɴ.

╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    } catch (error) {
      console.error(
        "❌ Could not notify user:",
        error.message
      );
    }
  });

  // ==========================================
  // SYSTEM STATUS
  // ==========================================

  bot.action("system_status", async (ctx) => {
    await ctx.answerCbQuery();

    if (!isOwner(ctx.from.id)) {
      return ctx.reply(
        "❌ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ."
      );
    }

    const data = readDatabase();
    const requests = Object.values(data.requests || {});

    const pending = requests.filter((request) =>
      [
        "PAYMENT_PENDING",
        "PAYMENT_PROOF_PENDING",
        "PENDING_OWNER_APPROVAL"
      ].includes(request.status)
    );

    const approved = requests.filter(
      (request) => request.status === "APPROVED"
    );

    const rejected = requests.filter(
      (request) => request.status === "REJECTED"
    );

    const cancelled = requests.filter(
      (request) => request.status === "CANCELLED"
    );

    const users = Object.keys(data.users || {}).length;

    await ctx.reply(
      `╭━━━〔 📊 Sʏsᴛᴇᴍ Sᴛᴀᴛᴜs 〕━━━╮

🤖 Bᴏᴛ:
🟢 Oɴʟɪɴᴇ

👥 Rᴇɢɪsᴛᴇʀᴇᴅ Uѕᴇʀs:
${users}

📩 Tᴏᴛᴀʟ Rᴇǫᴜᴇsᴛs:
${requests.length}

⏳ Pᴇɴᴅɪɴɢ:
${pending.length}

✅ Aᴘᴘʀᴏᴠᴇᴅ:
${approved.length}

❌ Rᴇᴊᴇᴄᴛᴇᴅ:
${rejected.length}

🚫 Cᴀɴᴄᴇʟʟᴇᴅ:
${cancelled.length}

👑 Oᴡɴᴇʀs:
${config.ownerIds.length}

🛡️ Mᴀɪɴᴛᴇɴᴀɴᴄᴇ:
${config.settings.maintenance ? "ON" : "OFF"}

╰━━━━━━━━━━━━━━━━━━━━╯`
    );
  });
}

module.exports = {
  registerHandlers
};
