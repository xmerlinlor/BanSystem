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

// ==================================================
// SERVICES
// ==================================================

const SERVICES = {
  whatsapp_ban: {
    name: "WhatsApp User Ban",
    price: config.prices.userBan
  },
  whatsapp_unban: {
    name: "WhatsApp User Unban",
    price: config.prices.userUnban
  },
  whatsapp_group_ban: {
    name: "WhatsApp Group Ban",
    price: config.prices.groupChannelBan
  },
  whatsapp_group_unban: {
    name: "WhatsApp Group Unban",
    price: config.prices.groupChannelUnban
  },
  whatsapp_channel_ban: {
    name: "WhatsApp Channel Ban",
    price: config.prices.groupChannelBan
  },
  whatsapp_channel_unban: {
    name: "WhatsApp Channel Unban",
    price: config.prices.groupChannelUnban
  },

  telegram_ban: {
    name: "Telegram User Ban",
    price: config.prices.userBan
  },
  telegram_unban: {
    name: "Telegram User Unban",
    price: config.prices.userUnban
  },
  telegram_group_ban: {
    name: "Telegram Group Ban",
    price: config.prices.groupChannelBan
  },
  telegram_group_unban: {
    name: "Telegram Group Unban",
    price: config.prices.groupChannelUnban
  },
  telegram_channel_ban: {
    name: "Telegram Channel Ban",
    price: config.prices.groupChannelBan
  },
  telegram_channel_unban: {
    name: "Telegram Channel Unban",
    price: config.prices.groupChannelUnban
  },
  telegram_bot_ban: {
    name: "Telegram Bot Ban",
    price: config.prices.userBan
  }
};

// ==================================================
// HELPERS
// ==================================================

function isOwner(userId) {
  return config.ownerIds.includes(String(userId));
}

function generateRequestId() {
  return `REQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function generatePaymentId() {
  return `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function ownerPanelText() {
  return `╭━━━〔 👑 Oᴡɴᴇʀ Pᴀɴᴇʟ 〕━━━╮

💳 Pᴀʏᴍᴇɴᴛ Mᴀɴᴀɢᴇᴍᴇɴᴛ
📩 Rᴇǫᴜᴇsᴛ Rᴇᴠɪᴇᴡ
💎 Pʀᴇᴍɪᴜᴍ Mᴀɴᴀɢᴇᴍᴇɴᴛ
👥 Uѕᴇʀ Mᴀɴᴀɢᴇᴍᴇɴᴛ
🛡️ Bᴀɴ Sʏsᴛᴇᴍ Cᴏɴᴛʀᴏʟ
📊 Sʏsᴛᴇᴍ Sᴛᴀᴛᴜs
📋 Aᴄᴛɪᴠɪᴛʏ Lᴏɢs
⚙️ Sʏsᴛᴇᴍ Sᴇᴛᴛɪɴɢs

╰━━━━━━━━━━━━━━━━━━╯`;
}

function ownerPanelButtons() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("💳 Pᴀʏᴍᴇɴᴛs", "owner_payments"),
      Markup.button.callback("📩 Rᴇǫᴜᴇsᴛs", "owner_requests")
    ],
    [
      Markup.button.callback("💎 Pʀᴇᴍɪᴜᴍ", "owner_premium"),
      Markup.button.callback("👥 Uѕᴇʀs", "owner_users")
    ],
    [
      Markup.button.callback("🛡️ Bᴀɴ Sʏsᴛᴇᴍ", "owner_ban_control"),
      Markup.button.callback("📊 Sᴛᴀᴛᴜs", "owner_status")
    ],
    [
      Markup.button.callback("📋 Lᴏɢs", "owner_logs"),
      Markup.button.callback("⚙️ Sᴇᴛᴛɪɴɢs", "owner_settings")
    ],
    [
      Markup.button.callback("🏠 Mᴀɪɴ Mᴇɴᴜ", "back_home")
    ]
  ]);
}

function requestButtons(requestId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "✅ Aᴘᴘʀᴏᴠᴇ",
        `approve_request:${requestId}`
      ),
      Markup.button.callback(
        "❌ Rᴇᴊᴇᴄᴛ",
        `reject_request:${requestId}`
      )
    ]
  ]);
}

function paymentText(service) {
  return `╭━━━〔 💳 Pᴀʏᴍᴇɴᴛ 〕━━━╮

🛡️ Sᴇʀᴠɪᴄᴇ:
${service.name}

💰 Aᴍᴏᴜɴᴛ: ₦${service.price}

━━━━━━━━━━━━━━━━━━━━

🏦 Bᴀɴᴋ: ${config.payment.bankName}
💳 Aᴄᴄᴏᴜɴᴛ: ${config.payment.accountNumber}
👤 Nᴀᴍᴇ: ${config.payment.accountName}

━━━━━━━━━━━━━━━━━━━━

📸 Aғᴛᴇʀ Pᴀʏᴍᴇɴᴛ:
Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Sᴄʀᴇᴇɴsʜᴏᴛ.

⚠️ Yᴏᴜʀ Rᴇǫᴜᴇsᴛ Wɪʟʟ Bᴇ Rᴇᴠɪᴇᴡᴇᴅ Bʏ Aɴ Oᴡɴᴇʀ.

╰━━━━━━━━━━━━━━━━━━━━╯`;
}

// ==================================================
// REGISTER HANDLERS
// ==================================================

function registerHandlers(bot) {

  // ==================================================
  // START
  // ==================================================

  bot.start(async (ctx) => {
    try {
      const userId = String(ctx.from.id);

      saveUser(userId, {
        userId,
        username: ctx.from.username || null,
        firstName: ctx.from.first_name || null,
        lastName: ctx.from.last_name || null
      });

      const forceJoin = await checkForceJoin(bot, userId);

      if (!forceJoin.joined) {
        return ctx.reply(
          `╭━━━〔 📢 Jᴏɪɴ Rᴇǫᴜɪʀᴇᴍᴇɴᴛ 〕━━━╮

👋 Hᴇʟʟᴏ ${ctx.from.first_name || "User"}!

⚠️ Pʟᴇᴀsᴇ Jᴏɪɴ Tʜᴇ Cʜᴀɴɴᴇʟs Bᴇʟᴏᴡ Tᴏ Cᴏɴᴛɪɴᴜᴇ.

╰━━━━━━━━━━━━━━━━━━━━╯`,
          {
            reply_markup: forceJoinKeyboard(forceJoin.notJoined)
          }
        );
      }

      await ctx.reply(
        getStartMenu(ctx),
        startButtons()
      );

    } catch (error) {
      console.error("❌ /start error:", error);
      await ctx.reply("❌ Aɴ Eʀʀᴏʀ Oᴄᴄᴜʀʀᴇᴅ.");
    }
  });

  // ==================================================
  // FORCE JOIN
  // ==================================================

  bot.action("check_force_join", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const result = await checkForceJoin(
        bot,
        String(ctx.from.id)
      );

      if (!result.joined) {
        return ctx.reply(
          "❌ Yᴏᴜ Hᴀᴠᴇ Nᴏᴛ Jᴏɪɴᴇᴅ Aʟʟ Rᴇǫᴜɪʀᴇᴅ Cʜᴀɴɴᴇʟs.",
          {
            reply_markup: forceJoinKeyboard(result.notJoined)
          }
        );
      }

      await ctx.reply(
        getStartMenu(ctx),
        startButtons()
      );

    } catch (error) {
      console.error("❌ Force join error:", error);
      await ctx.reply("❌ Fᴀɪʟᴇᴅ Tᴏ Cʜᴇᴄᴋ Jᴏɪɴ Sᴛᴀᴛᴜs.");
    }
  });

  // ==================================================
  // HOME
  // ==================================================

  bot.action("back_home", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      await ctx.reply(
        getStartMenu(ctx),
        startButtons()
      );

    } catch (error) {
      console.error("❌ Home error:", error);
    }
  });

  // ==================================================
  // SERVICES
  // ==================================================

  for (const [action, service] of Object.entries(SERVICES)) {
    bot.action(action, async (ctx) => {
      try {
        await ctx.answerCbQuery();

        const requestId = generateRequestId();

        saveRequest(requestId, {
          userId: String(ctx.from.id),
          username: ctx.from.username || null,
          service: action,
          serviceName: service.name,
          price: service.price,
          status: "TARGET_PENDING",
          target: null,
          reason: null
        });

        await ctx.reply(
          `╭━━━〔 🛡️ Nᴇᴡ Rᴇǫᴜᴇsᴛ 〕━━━╮

🆔 Rᴇǫᴜᴇsᴛ: ${requestId}

🛠️ Sᴇʀᴠɪᴄᴇ:
${service.name}

💰 Pʀɪᴄᴇ: ₦${service.price}

━━━━━━━━━━━━━━━━━━━━

🎯 Sᴇɴᴅ Tʜᴇ Tᴀʀɢᴇᴛ.

E.g:
• Phone number
• Telegram username
• Group ID
• Channel username
• Bot username

╰━━━━━━━━━━━━━━━━━━━━╯`
        );

      } catch (error) {
        console.error(`❌ ${action} error:`, error);
      }
    });
  }

  // ==================================================
  // PAYMENT
  // ==================================================

  bot.action("payment", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      await ctx.reply(
        `╭━━━〔 💳 Pᴀʏᴍᴇɴᴛ 〕━━━╮

🏦 Bᴀɴᴋ: ${config.payment.bankName}
💳 Aᴄᴄᴏᴜɴᴛ: ${config.payment.accountNumber}
👤 Nᴀᴍᴇ: ${config.payment.accountName}

━━━━━━━━━━━━━━━━━━━━

💰 Pʀɪᴄᴇs

👤 Uѕᴇʀ Bᴀɴ: ₦${config.prices.userBan}
🔓 Uѕᴇʀ Uɴʙᴀɴ: ₦${config.prices.userUnban}

👥 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Bᴀɴ: ₦${config.prices.groupChannelBan}
🔓 Gʀᴏᴜᴘ/Cʜᴀɴɴᴇʟ Uɴʙᴀɴ: ₦${config.prices.groupChannelUnban}

━━━━━━━━━━━━━━━━━━━━

📸 Pᴀʏ Fɪʀsᴛ, Tʜᴇɴ Sᴇɴᴅ Yᴏᴜʀ Pʀᴏᴏғ.

╰━━━━━━━━━━━━━━━━━━━━╯`
      );

    } catch (error) {
      console.error("❌ Payment error:", error);
    }
  });

  // ==================================================
  // REFERRAL
  // ==================================================

  bot.action("referral", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const botUsername =
        ctx.botInfo?.username || "YOUR_BOT";

      const link =
        `https://t.me/${botUsername}?start=ref_${ctx.from.id}`;

      await ctx.reply(
        `╭━━━〔 🎁 Rᴇғᴇʀʀᴀʟ 〕━━━╮

💰 Rᴇᴡᴀʀᴅ: ₦${config.referral.reward}

👥 Iɴᴠɪᴛᴇ Nᴇᴡ Uѕᴇʀs Tᴏ Tʜᴇ Bᴏᴛ.

🔗 Yᴏᴜʀ Rᴇғᴇʀʀᴀʟ Lɪɴᴋ:

${link}

━━━━━━━━━━━━━━━━━━━━

⚠️ Rᴇᴡᴀʀᴅ Iѕ Gɪᴠᴇɴ Fᴏʀ Sᴜᴄᴄᴇssғᴜʟ Rᴇғᴇʀʀᴀʟs.

╰━━━━━━━━━━━━━━━━━━━━╯`
      );

    } catch (error) {
      console.error("❌ Referral error:", error);
    }
  });

  // ==================================================
  // MY REQUESTS
  // ==================================================

  bot.action("my_requests", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const requests = getUserRequests(ctx.from.id);

      if (!requests.length) {
        return ctx.reply(
          `╭━━━〔 📩 Mʏ Rᴇǫᴜᴇsᴛs 〕━━━╮

❌ Yᴏᴜ Hᴀᴠᴇ Nᴏ Rᴇǫᴜᴇsᴛs Yᴇᴛ.

╰━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      const recent = requests
        .slice(-10)
        .reverse();

      let text =
        `╭━━━〔 📩 Mʏ Rᴇǫᴜᴇsᴛs 〕━━━╮\n\n`;

      for (const request of recent) {
        text +=
          `🆔 ${request.id}\n` +
          `🛠️ ${request.serviceName}\n` +
          `💰 ₦${request.price}\n` +
          `📊 ${request.status}\n\n`;
      }

      text += "╰━━━━━━━━━━━━━━━━━━━━╯";

      await ctx.reply(text);

    } catch (error) {
      console.error("❌ My requests error:", error);
    }
  });

  // ==================================================
  // ADMIN PANEL
  // ==================================================

  bot.action("admin_panel", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      await ctx.reply(
        ownerPanelText(),
        ownerPanelButtons()
      );

    } catch (error) {
      console.error("❌ Admin panel error:", error);
    }
  });

  // ==================================================
  // OWNER PANEL
  // ==================================================

  bot.action("owner_panel", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply(
          "❌ Oɴʟʏ Aᴜᴛʜᴏʀɪᴢᴇᴅ Oᴡɴᴇʀs Cᴀɴ Aᴄᴄᴇss Tʜɪs."
        );
      }

      await ctx.reply(
        ownerPanelText(),
        ownerPanelButtons()
      );

    } catch (error) {
      console.error("❌ Owner panel error:", error);
    }
  });

  // ==================================================
  // OWNER REQUESTS
  // ==================================================

  bot.action("owner_requests", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      const requests = getPendingRequests();

      if (!requests.length) {
        return ctx.reply(
          `╭━━━〔 📩 Pᴇɴᴅɪɴɢ Rᴇǫᴜᴇsᴛs 〕━━━╮

✅ Nᴏ Pᴇɴᴅɪɴɢ Rᴇǫᴜᴇsᴛs.

╰━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      for (const request of requests.slice(0, 20)) {
        await ctx.reply(
          `╭━━━〔 📩 Rᴇǫᴜᴇsᴛ 〕━━━╮

🆔 ${request.id}

👤 Uѕᴇʀ: ${request.userId}

🛠️ Sᴇʀᴠɪᴄᴇ:
${request.serviceName}

🎯 Tᴀʀɢᴇᴛ:
${request.target || "Not provided"}

📝 Rᴇᴀsᴏɴ:
${request.reason || "Not provided"}

💰 Aᴍᴏᴜɴᴛ: ₦${request.price}

📊 Sᴛᴀᴛᴜs:
${request.status}

╰━━━━━━━━━━━━━━━━━━━━╯`,
          requestButtons(request.id)
        );
      }

    } catch (error) {
      console.error("❌ Owner requests error:", error);
    }
  });

  // ==================================================
  // OWNER PAYMENTS
  // ==================================================

  bot.action("owner_payments", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      const data = readDatabase();
      const payments = Object.values(data.payments);

      if (!payments.length) {
        return ctx.reply(
          "💳 Nᴏ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴏʀᴅs Fᴏᴜɴᴅ."
        );
      }

      let text =
        `╭━━━〔 💳 Pᴀʏᴍᴇɴᴛs 〕━━━╮\n\n`;

      for (const payment of payments.slice(-20).reverse()) {
        text +=
          `🆔 ${payment.id}\n` +
          `👤 ${payment.userId}\n` +
          `💰 ₦${payment.amount || 0}\n` +
          `📊 ${payment.status || "PENDING"}\n\n`;
      }

      text += "╰━━━━━━━━━━━━━━━━━━━━╯";

      await ctx.reply(text);

    } catch (error) {
      console.error("❌ Owner payments error:", error);
    }
  });

  // ==================================================
  // OWNER STATUS
  // ==================================================

  bot.action("owner_status", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      const data = readDatabase();

      await ctx.reply(
        `╭━━━〔 📊 Sʏsᴛᴇᴍ Sᴛᴀᴛᴜs 〕━━━╮

👥 Uѕᴇʀs: ${Object.keys(data.users).length}
📩 Rᴇǫᴜᴇsᴛs: ${Object.keys(data.requests).length}
💳 Pᴀʏᴍᴇɴᴛs: ${Object.keys(data.payments).length}
🎁 Rᴇғᴇʀʀᴀʟs: ${Object.keys(data.referrals).length}
🛡️ Bᴀɴ Rᴇᴄᴏʀᴅs: ${Object.keys(data.bans).length}
📋 Lᴏɢs: ${Object.keys(data.logs).length}

⚙️ Mᴀɪɴᴛᴇɴᴀɴᴄᴇ:
${config.settings.maintenance ? "ON" : "OFF"}

👑 Oᴡɴᴇʀ Aᴘᴘʀᴏᴠᴀʟ:
${config.settings.requireOwnerApproval ? "ON" : "OFF"}

╰━━━━━━━━━━━━━━━━━━━━╯`
      );

    } catch (error) {
      console.error("❌ Owner status error:", error);
    }
  });

  // ==================================================
  // OWNER LOGS
  // ==================================================

  bot.action("owner_logs", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      const data = readDatabase();
      const logs = Object.values(data.logs);

      if (!logs.length) {
        return ctx.reply("📋 Nᴏ Lᴏɢs Fᴏᴜɴᴅ.");
      }

      let text =
        `╭━━━〔 📋 Aᴄᴛɪᴠɪᴛʏ Lᴏɢs 〕━━━╮\n\n`;

      for (const log of logs.slice(-15).reverse()) {
        text +=
          `🆔 ${log.id}\n` +
          `📌 ${log.action || "Activity"}\n` +
          `👤 ${log.userId || "System"}\n` +
          `🕒 ${log.createdAt}\n\n`;
      }

      text += "╰━━━━━━━━━━━━━━━━━━━━╯";

      await ctx.reply(text);

    } catch (error) {
      console.error("❌ Owner logs error:", error);
    }
  });

  // ==================================================
  // OWNER PLACEHOLDERS
  // ==================================================

  const ownerPlaceholders = [
    ["owner_premium", "💎 Pʀᴇᴍɪᴜᴍ Mᴀɴᴀɢᴇᴍᴇɴᴛ"],
    ["owner_users", "👥 Uѕᴇʀ Mᴀɴᴀɢᴇᴍᴇɴᴛ"],
    ["owner_ban_control", "🛡️ Bᴀɴ Sʏsᴛᴇᴍ Cᴏɴᴛʀᴏʟ"],
    ["owner_settings", "⚙️ Sʏsᴛᴇᴍ Sᴇᴛᴛɪɴɢs"]
  ];

  for (const [action, name] of ownerPlaceholders) {
    bot.action(action, async (ctx) => {
      try {
        await ctx.answerCbQuery();

        if (!isOwner(ctx.from.id)) {
          return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
        }

        await ctx.reply(
          `╭━━━〔 ${name} 〕━━━╮

🚧 Tʜɪs Sᴇᴄᴛɪᴏɴ Iѕ Bᴇɪɴɢ Cᴏɴғɪɢᴜʀᴇᴅ.

╰━━━━━━━━━━━━━━━━━━━━╯`
        );

      } catch (error) {
        console.error(`❌ ${action} error:`, error);
      }
    });
  }

  // ==================================================
  // TEXT INPUT
  // ==================================================

  bot.on("text", async (ctx) => {
    try {
      const userId = String(ctx.from.id);
      const text = ctx.message.text.trim();

      if (text.startsWith("/")) {
        return;
      }

      const requests = getUserRequests(userId);

      const activeRequest = requests
        .filter((request) =>
          [
            "TARGET_PENDING",
            "REASON_PENDING"
          ].includes(request.status)
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || 0) -
            new Date(a.updatedAt || 0)
        )[0];

      if (!activeRequest) {
        return;
      }

      if (activeRequest.status === "TARGET_PENDING") {
        saveRequest(activeRequest.id, {
          target: text,
          status: "REASON_PENDING"
        });

        return ctx.reply(
          `🎯 Tᴀʀɢᴇᴛ Sᴀᴠᴇᴅ.

📝 Nᴏᴡ Sᴇɴᴅ Tʜᴇ Rᴇᴀsᴏɴ Fᴏʀ Tʜɪs Rᴇǫᴜᴇsᴛ.`
        );
      }

      if (activeRequest.status === "REASON_PENDING") {
        saveRequest(activeRequest.id, {
          reason: text,
          status: "PAYMENT_PENDING"
        });

        return ctx.reply(
          paymentText({
            name: activeRequest.serviceName,
            price: activeRequest.price
          }),
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "💳 Pᴀʏᴍᴇɴᴛ Sᴇɴᴛ",
                `payment_sent:${activeRequest.id}`
              )
            ]
          ])
        );
      }

    } catch (error) {
      console.error("❌ Text handler error:", error);
    }
  });

  // ==================================================
  // PAYMENT SENT
  // ==================================================

  bot.action(/^payment_sent:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const requestId = ctx.match[1];
      const request = getRequest(requestId);

      if (!request) {
        return ctx.reply("❌ Rᴇǫᴜᴇsᴛ Nᴏᴛ Fᴏᴜɴᴅ.");
      }

      if (String(request.userId) !== String(ctx.from.id)) {
        return ctx.reply(
          "❌ Tʜɪs Iѕ Nᴏᴛ Yᴏᴜʀ Rᴇǫᴜᴇsᴛ."
        );
      }

      saveRequest(requestId, {
        status: "PAYMENT_PROOF_PENDING"
      });

      await ctx.reply(
        `📸 Pᴀʏᴍᴇɴᴛ Mᴀʀᴋᴇᴅ.

Nᴏᴡ Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Sᴄʀᴇᴇɴsʜᴏᴛ.`
      );

    } catch (error) {
      console.error("❌ Payment sent error:", error);
    }
  });

  // ==================================================
  // PAYMENT PROOF
  // ==================================================

  bot.on("photo", async (ctx) => {
    try {
      const userId = String(ctx.from.id);

      const requests = getUserRequests(userId);

      const request = requests
        .filter(
          (item) =>
            item.status === "PAYMENT_PROOF_PENDING"
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || 0) -
            new Date(a.updatedAt || 0)
        )[0];

      if (!request) {
        return ctx.reply(
          "❌ Nᴏ Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ Rᴇǫᴜᴇsᴛ Iѕ Wᴀɪᴛɪɴɢ."
        );
      }

      const photo =
        ctx.message.photo[
          ctx.message.photo.length - 1
        ];

      const paymentId = generatePaymentId();

      savePayment(paymentId, {
        requestId: request.id,
        userId,
        amount: request.price,
        proofFileId: photo.file_id,
        status: "PENDING_REVIEW"
      });

      saveRequest(request.id, {
        status: "PENDING_OWNER_APPROVAL",
        paymentId,
        paymentProof: photo.file_id
      });

      addLog({
        action: "PAYMENT_PROOF_SUBMITTED",
        userId,
        requestId: request.id,
        paymentId
      });

      await ctx.reply(
        `╭━━━〔 ⏳ Rᴇǫᴜᴇsᴛ Sᴜʙᴍɪᴛᴛᴇᴅ 〕━━━╮

🆔 Rᴇǫᴜᴇsᴛ: ${request.id}

💳 Pᴀʏᴍᴇɴᴛ: Rᴇᴄᴇɪᴠᴇᴅ
📊 Sᴛᴀᴛᴜs: Pᴇɴᴅɪɴɢ Oᴡɴᴇʀ Rᴇᴠɪᴇᴡ

👑 Aɴ Oᴡɴᴇʀ Wɪʟʟ Rᴇᴠɪᴇᴡ Yᴏᴜʀ Rᴇǫᴜᴇsᴛ.

╰━━━━━━━━━━━━━━━━━━━━╯`
      );

      for (const ownerId of config.ownerIds) {
        try {
          await bot.telegram.sendPhoto(
            ownerId,
            photo.file_id,
            {
              caption:
                `📩 Nᴇᴡ Pᴀʏᴍᴇɴᴛ Pʀᴏᴏғ\n\n` +
                `🆔 Rᴇǫᴜᴇsᴛ: ${request.id}\n` +
                `👤 Uѕᴇʀ: ${userId}\n` +
                `🛠️ Sᴇʀᴠɪᴄᴇ: ${request.serviceName}\n` +
                `💰 Aᴍᴏᴜɴᴛ: ₦${request.price}\n` +
                `🎯 Tᴀʀɢᴇᴛ: ${request.target || "N/A"}`,
              ...requestButtons(request.id)
            }
          );
        } catch (ownerError) {
          console.error(
            `❌ Failed notifying owner ${ownerId}:`,
            ownerError.message
          );
        }
      }

    } catch (error) {
      console.error("❌ Payment proof error:", error);
    }
  });

  // ==================================================
  // APPROVE
  // ==================================================

  bot.action(/^approve_request:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      const requestId = ctx.match[1];
      const request = getRequest(requestId);

      if (!request) {
        return ctx.reply("❌ Rᴇǫᴜᴇsᴛ Nᴏᴛ Fᴏᴜɴᴅ.");
      }

      saveRequest(requestId, {
        status: "APPROVED",
        approvedBy: String(ctx.from.id),
        approvedAt: new Date().toISOString()
      });

      if (request.paymentId) {
        savePayment(request.paymentId, {
          status: "APPROVED",
          approvedBy: String(ctx.from.id)
        });
      }

      addLog({
        action: "REQUEST_APPROVED",
        ownerId: String(ctx.from.id),
        userId: request.userId,
        requestId
      });

      await ctx.reply(
        `✅ Rᴇǫᴜᴇsᴛ Aᴘᴘʀᴏᴠᴇᴅ.

🆔 ${requestId}

⚠️ Tʜᴇ Rᴇǫᴜᴇsᴛ Iѕ Aᴘᴘʀᴏᴠᴇᴅ Fᴏʀ Pʀᴏᴄᴇssɪɴɢ.`
      );

      try {
        await bot.telegram.sendMessage(
          request.userId,
          `╭━━━〔 ✅ Rᴇǫᴜᴇsᴛ Aᴘᴘʀᴏᴠᴇᴅ 〕━━━╮

🆔 ${requestId}

🛠️ ${request.serviceName}

💰 ₦${request.price}

👑 Oᴡɴᴇʀ Rᴇᴠɪᴇᴡ: Aᴘᴘʀᴏᴠᴇᴅ

╰━━━━━━━━━━━━━━━━━━━━╯`
        );
      } catch (notifyError) {
        console.error(
          "❌ User approval notification failed:",
          notifyError.message
        );
      }

    } catch (error) {
      console.error("❌ Approve error:", error);
    }
  });

  // ==================================================
  // REJECT
  // ==================================================

  bot.action(/^reject_request:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!isOwner(ctx.from.id)) {
        return ctx.reply("❌ Aᴄᴄᴇss Dᴇɴɪᴇᴅ.");
      }

      const requestId = ctx.match[1];
      const request = getRequest(requestId);

      if (!request) {
        return ctx.reply("❌ Rᴇǫᴜᴇsᴛ Nᴏᴛ Fᴏᴜɴᴅ.");
      }

      saveRequest(requestId, {
        status: "REJECTED",
        rejectedBy: String(ctx.from.id),
        rejectedAt: new Date().toISOString()
      });

      if (request.paymentId) {
        savePayment(request.paymentId, {
          status: "REJECTED",
          rejectedBy: String(ctx.from.id)
        });
      }

      addLog({
        action: "REQUEST_REJECTED",
        ownerId: String(ctx.from.id),
        userId: request.userId,
        requestId
      });

      await ctx.reply(
        `❌ Rᴇǫᴜᴇsᴛ Rᴇᴊᴇᴄᴛᴇᴅ.

🆔 ${requestId}`
      );

      try {
        await bot.telegram.sendMessage(
          request.userId,
          `❌ Yᴏᴜʀ Rᴇǫᴜᴇsᴛ Wᴀs Rᴇᴊᴇᴄᴛᴇᴅ.

🆔 ${requestId}

📩 Cᴏɴᴛᴀᴄᴛ Tʜᴇ Oᴡɴᴇʀ Fᴏʀ Mᴏʀᴇ Iɴғᴏʀᴍᴀᴛɪᴏɴ.`
        );
      } catch (notifyError) {
        console.error(
          "❌ User rejection notification failed:",
          notifyError.message
        );
      }

    } catch (error) {
      console.error("❌ Reject error:", error);
    }
  });

  // ==================================================
  // UNKNOWN CALLBACK
  // ==================================================

  bot.on("callback_query", async (ctx) => {
    try {
      await ctx.answerCbQuery();
    } catch (_) {
      // Already answered.
    }
  });

  console.log("✅ Telegram handlers registered.");
}

module.exports = {
  registerHandlers
};
