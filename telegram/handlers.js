// telegram/handlers.js

const { Markup } = require("telegraf");
const config = require("../config");

const {
  getStartMenu
} = require("./menu");

const {
  getUser,
  saveUser,
  getRequest,
  saveRequest,
  getUserRequests,
  getPendingRequests,
  savePayment,
  getPayment,
  saveBan,
  addLog
} = require("../database/database");

const {
  executeBanRequest
} = require("../services/banService");

// ==================================================
// SETTINGS
// ==================================================

const REQUIRED_REPORTS = 5;

const waiting = new Map();

// ==================================================
// HELPERS
// ==================================================

function userId(ctx) {
  return String(ctx.from?.id || "");
}

function username(ctx) {
  return ctx.from?.username
    ? `@${ctx.from.username}`
    : ctx.from?.first_name || "User";
}

function isOwner(ctx) {
  return config.ownerIds.includes(userId(ctx));
}

function money(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function now() {
  return new Date().toLocaleString("en-GB", {
    timeZone: "Africa/Lagos"
  });
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
}

function getBalance(ctx) {
  const user = getUser(userId(ctx));

  return Number(
    user?.balance ||
    user?.wallet ||
    0
  );
}

function setBalance(id, amount) {
  const user = getUser(id) || {
    id,
    balance: 0
  };

  user.balance = Number(amount);

  saveUser(id, user);

  return user;
}

function changeBalance(id, amount) {
  const user = getUser(id) || {
    id,
    balance: 0
  };

  user.balance =
    Number(user.balance || 0) +
    Number(amount || 0);

  if (user.balance < 0) {
    user.balance = 0;
  }

  saveUser(id, user);

  return user.balance;
}

function isPremium(id) {
  const user = getUser(String(id));

  return Boolean(
    user?.premium === true ||
    user?.isPremium === true
  );
}

function setPremium(id, value) {
  const user = getUser(String(id)) || {
    id: String(id)
  };

  user.premium = Boolean(value);
  user.isPremium = Boolean(value);

  saveUser(String(id), user);

  return user;
}

function getReportCount(request) {
  return Array.isArray(request?.reports)
    ? request.reports.length
    : Number(request?.reportCount || 0);
}

function hasReported(request, id) {
  return Array.isArray(request?.reports)
    ? request.reports.some(
        report =>
          String(report.userId) === String(id)
      )
    : false;
}

function addReport(request, ctx) {
  if (!Array.isArray(request.reports)) {
    request.reports = [];
  }

  if (hasReported(request, userId(ctx))) {
    return false;
  }

  request.reports.push({
    userId: userId(ctx),
    username: username(ctx),
    submittedAt: now()
  });

  request.reportCount =
    request.reports.length;

  return true;
}

function reportStatus(request) {
  const count = getReportCount(request);

  let text = "";

  for (let i = 1; i <= REQUIRED_REPORTS; i++) {
    text +=
      i <= count
        ? `✅ Report ${i}/5\n`
        : `⬜ Report ${i}/5\n`;
  }

  return text.trim();
}

function banGuard(request, status = "REPORT VERIFICATION") {
  return `🛡️ Bᴀɴ Gᴜᴀʀᴅ

📱 Target: ${request.target}
🔴 Status: ${status}

━━━━━━━━━━━━━━━━━━

📊 Rᴇᴘᴏʀᴛ Pʀᴏɢʀᴇss

${reportStatus(request)}

━━━━━━━━━━━━━━━━━━

📊 Reports: ${getReportCount(request)}/${REQUIRED_REPORTS}`;
}

function requestSummary(request) {
  return `🆔 Request: ${request.id}
👤 User: ${request.username || request.userId}
🛡️ Service: ${request.service}
📱 Target: ${request.target}
📝 Reason: ${request.reason || "Not provided"}
📊 Reports: ${getReportCount(request)}/${REQUIRED_REPORTS}
💰 Price: ${money(request.price)}
📌 Status: ${request.status}`;
}

// ==================================================
// SERVICE PRICES
// ==================================================

function getPrice(service) {
  switch (service) {
    case "whatsapp_ban":
      return Number(config.prices.userBan || 0);

    case "whatsapp_unban":
      return Number(config.prices.userUnban || 0);

    case "whatsapp_group_ban":
    case "whatsapp_channel_ban":
    case "telegram_group_ban":
    case "telegram_channel_ban":
      return Number(
        config.prices.groupChannelBan || 0
      );

    case "whatsapp_group_unban":
    case "whatsapp_channel_unban":
    case "telegram_group_unban":
    case "telegram_channel_unban":
      return Number(
        config.prices.groupChannelUnban || 0
      );

    case "telegram_ban":
      return Number(config.prices.userBan || 0);

    case "telegram_unban":
      return Number(config.prices.userUnban || 0);

    default:
      return 0;
  }
}

// ==================================================
// TARGET VALIDATION
// ==================================================

function validPhone(value) {
  return /^\d{8,15}$/.test(
    String(value || "")
  );
}

function validWhatsAppGroup(value) {
  return /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/i.test(
    String(value || "").trim()
  );
}

function validWhatsAppChannel(value) {
  return /^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9_-]+$/i.test(
    String(value || "").trim()
  );
}

function validTelegramId(value) {
  return /^-?\d+$/.test(
    String(value || "").trim()
  );
}

// ==================================================
// START
// ==================================================

async function startCommand(ctx) {
  return ctx.reply(
    getStartMenu(ctx),
    {
      parse_mode: "HTML"
    }
  );
}

// ==================================================
// HELP
// ==================================================

async function helpCommand(ctx) {
  return ctx.reply(
`🛡️ Bᴀɴ Sʏsᴛᴇᴍ Hᴇʟᴘ

📱 WʜᴀᴛsAᴘᴘ

/ban 234xxxxxxxxx
/unban 234xxxxxxxxx

/bangroup https://chat.whatsapp.com/...
/unbangroup https://chat.whatsapp.com/...

/banchannel https://whatsapp.com/channel/...
/unbanchannel https://whatsapp.com/channel/...

✈️ Tᴇʟᴇɢʀᴀᴍ

/tgban USER_ID
/tgunban USER_ID

/tggroupban GROUP_ID
/tggroupunban GROUP_ID

/tgchannelban CHANNEL_ID
/tgchannelunban CHANNEL_ID

💰 Aᴄᴄᴏᴜɴᴛ

/balance
/deposit AMOUNT
/deposits
/transactions
/profile
/id
/referral

📋 Rᴇǫᴜᴇsᴛs

/myrequests
/history
/status REQUEST_ID
/cancel REQUEST_ID`
  );
}

// ==================================================
// PROFILE
// ==================================================

async function profileCommand(ctx) {
  const id = userId(ctx);

  return ctx.reply(
`👤 Pʀᴏғɪʟᴇ

├ 👤 User: ${username(ctx)}
├ 🆔 ID: ${id}
├ 💎 Premium: ${isPremium(id) ? "Yes" : "No"}
└ 💰 Balance: ${money(getBalance(ctx))}`
  );
}

async function idCommand(ctx) {
  return ctx.reply(
    `🆔 Yᴏᴜʀ Tᴇʟᴇɢʀᴀᴍ ID\n\n${userId(ctx)}`
  );
}

// ==================================================
// BALANCE
// ==================================================

async function balanceCommand(ctx) {
  return ctx.reply(
`💰 Bᴀʟᴀɴᴄᴇ

💵 Balance: ${money(getBalance(ctx))}

💳 Use:
/deposit AMOUNT

to add funds.`
  );
}

// ==================================================
// DEPOSIT
// ==================================================

async function depositCommand(ctx) {
  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const amount = Number(args[1]);

  if (!amount || amount <= 0) {
    return ctx.reply(
      "❌ Usage:\n/deposit 5000"
    );
  }

  const id = makeId("DEP");

  const payment = {
    id,
    userId: userId(ctx),
    username: username(ctx),
    amount,
    status: "PAYMENT_PENDING",
    createdAt: now()
  };

  savePayment(id, payment);

  return ctx.reply(
`💳 Dᴇᴘᴏsɪᴛ Rᴇǫᴜᴇsᴛ

🆔 Deposit: ${id}
💵 Amount: ${money(amount)}

🏦 Payment Information

Bank: ${config.payment.bankName}
Account: ${config.payment.accountNumber}
Name: ${config.payment.accountName}

━━━━━━━━━━━━━━━━━━

📸 After payment, send your
payment proof to this chat.

⏳ Status: WAITING FOR PAYMENT PROOF

👑 Your deposit will be credited
after owner verification.`
  );
}

// ==================================================
// REQUEST CREATION
// ==================================================

function createRequest(ctx, service, target) {
  const requestId = makeId("REQ");

  const request = {
    id: requestId,

    userId: userId(ctx),
    username: username(ctx),

    service,
    target,

    reason: null,

    price: getPrice(service),

    reportCount: 0,
    reports: [],

    status: "REPORT_PENDING",

    paymentStatus: "UNPAID",
    executionStatus: "WAITING",

    createdAt: now(),
    updatedAt: now()
  };

  saveRequest(requestId, request);

  return request;
}

// ==================================================
// BAN COMMAND
// ==================================================

async function banCommand(ctx) {
  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const target = args[1];

  if (!target) {
    return ctx.reply(
`🛡️ WʜᴀᴛsAᴘᴘ Bᴀɴ

Usage:

/ban 234xxxxxxxxx

📱 Phone number only.`
    );
  }

  if (!validPhone(target)) {
    return ctx.reply(
      "❌ Invalid WhatsApp phone number.\n\nUse numbers only."
    );
  }

  const request =
    createRequest(
      ctx,
      "whatsapp_ban",
      target
    );

  waiting.set(userId(ctx), {
    type: "reason",
    requestId: request.id
  });

  return ctx.reply(
`${banGuard(request)}

━━━━━━━━━━━━━━━━━━

📝 Rᴇᴀsᴏɴ

Please send the reason for this request.

Example:
Age verification failure`
  );
}

// ==================================================
// UNBAN COMMAND
// ==================================================

async function unbanCommand(ctx) {
  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const target = args[1];

  if (!target) {
    return ctx.reply(
`🔓 WʜᴀᴛsAᴘᴘ Uɴʙᴀɴ

Usage:

/unban 234xxxxxxxxx

📱 Phone number only.`
    );
  }

  if (!validPhone(target)) {
    return ctx.reply(
      "❌ Invalid WhatsApp phone number."
    );
  }

  const request =
    createRequest(
      ctx,
      "whatsapp_unban",
      target
    );

  const existing = require("../database/database")
    .getBan(target);

  request.banRecord = existing || null;

  if (existing) {
    request.reason =
      existing.reason ||
      "Previous ban record";
  }

  request.unbanType =
    "Permanent Unban";

  saveRequest(request.id, request);

  return ctx.reply(
`🔓 WʜᴀᴛsAᴘᴘ Uɴʙᴀɴ

${existing
  ? `🛡️ Bᴀɴ Gᴜᴀʀᴅ

📱 Phone: ${target}
🔴 Status: BANNED
📝 Reason: ${existing.reason || "Not recorded"}
⏳ Type: ${existing.type || "Permanent"}
🕐 Ban at: ${existing.banAt || "Unknown"}`
  : `📱 Phone: ${target}

⚠️ No saved BAN GUARD record was found.`}

━━━━━━━━━━━━━━━━━━

⚙️ Uɴʙᴀɴ Tʏᴘᴇ

🔓 Permanently Unban

━━━━━━━━━━━━━━━━━━

📊 5-report verification is required
before the request can proceed.

Use:

/report ${request.id}`
  );
}

// ==================================================
// REPORT COMMAND
// ==================================================

async function reportCommand(ctx) {
  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const requestId = args[1];

  if (!requestId) {
    return ctx.reply(
      "❌ Usage:\n/report REQUEST_ID"
    );
  }

  const request =
    getRequest(requestId);

  if (!request) {
    return ctx.reply(
      "❌ Request not found."
    );
  }

  if (
    String(request.userId) !==
      userId(ctx) &&
    !isOwner(ctx)
  ) {
    return ctx.reply(
      "❌ You cannot modify this request."
    );
  }

  if (
    request.status ===
    "COMPLETED"
  ) {
    return ctx.reply(
      "❌ This request is already completed."
    );
  }

  if (hasReported(request, userId(ctx))) {
    return ctx.reply(
      "⚠️ You have already submitted a report for this request."
    );
  }

  const added =
    addReport(request, ctx);

  if (!added) {
    return ctx.reply(
      "⚠️ Report was not added."
    );
  }

  request.updatedAt = now();

  if (
    getReportCount(request) >=
    REQUIRED_REPORTS
  ) {
    request.status =
      "REPORTS_VERIFIED";
  }

  saveRequest(
    request.id,
    request
  );

  if (
    getReportCount(request) <
    REQUIRED_REPORTS
  ) {
    return ctx.reply(
`${banGuard(
  request,
  "REPORT VERIFICATION"
)}

⏳ ${getReportCount(request)}/5 reports verified.

Waiting for ${
  REQUIRED_REPORTS -
  getReportCount(request)
} more legitimate report/review records.`
    );
  }

  return ctx.reply(
`${banGuard(
  request,
  "REPORTS VERIFIED"
)}

━━━━━━━━━━━━━━━━━━

✅ 5-REPORT REQUIREMENT COMPLETE

💰 Required: ${money(request.price)}
💵 Balance: ${money(getBalance(ctx))}

${getBalance(ctx) >= request.price
  ? "✅ Balance is sufficient."
  : `❌ Missing: ${money(
      request.price -
      getBalance(ctx)
    )}

Use:
/deposit ${
      request.price -
      getBalance(ctx)
    }`}

${getBalance(ctx) >= request.price
  ? "\n👑 Request is ready for owner approval."
  : ""}`
  );
}

// ==================================================
// MY REQUESTS
// ==================================================

async function myRequestsCommand(ctx) {
  const requests =
    getUserRequests(userId(ctx)) || [];

  if (!requests.length) {
    return ctx.reply(
      "📋 You have no requests yet."
    );
  }

  const recent =
    requests.slice(-10).reverse();

  let text =
    "📋 Yᴏᴜʀ Rᴇǫᴜᴇsᴛs\n\n";

  for (const request of recent) {
    text +=
`🆔 ${request.id}
🛡️ ${request.service}
🎯 ${request.target}
📊 ${request.status}
━━━━━━━━━━━━━━━━━━
`;
  }

  return ctx.reply(text);
}

// ==================================================
// STATUS
// ==================================================

async function statusCommand(ctx) {
  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const requestId = args[1];

  if (!requestId) {
    return ctx.reply(
      "❌ Usage:\n/status REQUEST_ID"
    );
  }

  const request =
    getRequest(requestId);

  if (!request) {
    return ctx.reply(
      "❌ Request not found."
    );
  }

  if (
    String(request.userId) !==
      userId(ctx) &&
    !isOwner(ctx)
  ) {
    return ctx.reply(
      "❌ You cannot view this request."
    );
  }

  return ctx.reply(
    requestSummary(request)
  );
}

// ==================================================
// CANCEL
// ==================================================

async function cancelCommand(ctx) {
  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const requestId = args[1];

  if (!requestId) {
    return ctx.reply(
      "❌ Usage:\n/cancel REQUEST_ID"
    );
  }

  const request =
    getRequest(requestId);

  if (!request) {
    return ctx.reply(
      "❌ Request not found."
    );
  }

  if (
    String(request.userId) !==
    userId(ctx)
  ) {
    return ctx.reply(
      "❌ This is not your request."
    );
  }

  if (
    [
      "COMPLETED",
      "PROCESSING"
    ].includes(request.status)
  ) {
    return ctx.reply(
      "❌ This request can no longer be cancelled."
    );
  }

  request.status = "CANCELLED";
  request.updatedAt = now();

  saveRequest(
    request.id,
    request
  );

  return ctx.reply(
`❌ Rᴇǫᴜᴇsᴛ Cᴀɴᴄᴇʟʟᴇᴅ

🆔 ${request.id}

The request has been cancelled.`
  );
}

// ==================================================
// OWNER CHECK
// ==================================================

async function ownerOnly(ctx) {
  if (!isOwner(ctx)) {
    await ctx.reply(
      "⛔ Oᴡɴᴇʀ Oɴʟʏ."
    );

    return false;
  }

  return true;
}

// ==================================================
// OWNER PANEL
// ==================================================

async function ownerCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  return ctx.reply(
`👑 Oᴡɴᴇʀ Pᴀɴᴇʟ

📋 Rᴇǫᴜᴇsᴛs
/requests
/pending
/approve REQUEST_ID
/reject REQUEST_ID

💳 Pᴀʏᴍᴇɴᴛs
/payments
/paymentinfo ID

👥 Uѕᴇʀs
/users
/userinfo USER_ID

💎 Pʀᴇᴍɪᴜᴍ
/premium USER_ID
/premiumoff USER_ID
/premiuminfo USER_ID
/premiumusers

💰 Wᴀʟʟᴇᴛ
/credit USER_ID AMOUNT
/debit USER_ID AMOUNT

📊 Sʏsᴛᴇᴍ
/stats
/logs`
  );
}

// ==================================================
// REQUESTS
// ==================================================

async function requestsCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const requests =
    getPendingRequests() || [];

  if (!requests.length) {
    return ctx.reply(
      "📋 No pending requests."
    );
  }

  let text =
    "👑 Pᴇɴᴅɪɴɢ Rᴇǫᴜᴇsᴛs\n\n";

  for (const request of requests) {
    text +=
`🆔 ${request.id}
👤 ${request.username || request.userId}
🛡️ ${request.service}
🎯 ${request.target}
📊 ${getReportCount(request)}/5
💰 ${money(request.price)}
📌 ${request.status}

━━━━━━━━━━━━━━━━━━
`;
  }

  return ctx.reply(text);
}

async function pendingCommand(ctx) {
  return requestsCommand(ctx);
}

// ==================================================
// APPROVE
// ==================================================

async function approveCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const requestId = args[1];

  if (!requestId) {
    return ctx.reply(
      "❌ Usage:\n/approve REQUEST_ID"
    );
  }

  const request =
    getRequest(requestId);

  if (!request) {
    return ctx.reply(
      "❌ Request not found."
    );
  }

  if (
    getReportCount(request) <
    REQUIRED_REPORTS
  ) {
    return ctx.reply(
`❌ Rᴇǫᴜᴇsᴛ Cᴀɴɴᴏᴛ Bᴇ Aᴘᴘʀᴏᴠᴇᴅ

🆔 ${request.id}

📊 Reports:
${getReportCount(request)}/5

The 5-report verification requirement
has not been completed.`
    );
  }

  const balance =
    getBalance({
      from: {
        id: request.userId
      }
    });

  if (
    balance <
    Number(request.price)
  ) {
    request.status =
      "INSUFFICIENT_BALANCE";

    saveRequest(
      request.id,
      request
    );

    return ctx.reply(
`❌ Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ

👤 User: ${request.username || request.userId}
💰 Current: ${money(balance)}
💵 Required: ${money(request.price)}
📉 Missing: ${money(
  request.price - balance
)}`
    );
  }

  changeBalance(
    request.userId,
    -Number(request.price)
  );

  request.status =
    "PENDING_OWNER_APPROVAL";

  request.approvedBy =
    userId(ctx);

  request.approvedAt =
    now();

  request.paymentStatus =
    "APPROVED";

  request.executionStatus =
    "PROCESSING";

  saveRequest(
    request.id,
    request
  );

  await ctx.reply(
`✅ Rᴇǫᴜᴇsᴛ Aᴘᴘʀᴏᴠᴇᴅ

🆔 ${request.id}
📱 Target: ${request.target}

🔋 Starting execution system...

⚠️ The progress animation is only a
visual processing indicator.`
  );

  await processApprovedRequest(
    ctx,
    request
  );
}

// ==================================================
// EXECUTION ANIMATION
// ==================================================

async function progressAnimation(
  ctx,
  request
) {
  const message =
    await ctx.telegram.sendMessage(
      request.userId,
`🛡️ Bᴀɴ Gᴜᴀʀᴅ

📱 Target: ${request.target}
🟡 Status: PROCESSING

━━━━━━━━━━━━━━━━━━

🔋 Sʏsᴛᴇᴍ Lᴏᴀᴅɪɴɢ...

[░░░░░░░░░░] 1%

⏳ Initializing...`
    );

  const stages = [
    [20, "██░░░░░░░░"],
    [40, "████░░░░░░"],
    [60, "██████░░░░"],
    [80, "████████░░"],
    [100, "██████████"]
  ];

  for (const [percent, bar] of stages) {
    await new Promise(
      resolve =>
        setTimeout(resolve, 500)
    );

    await ctx.telegram.editMessageText(
      request.userId,
      message.message_id,
      undefined,
`🛡️ Bᴀɴ Gᴜᴀʀᴅ

📱 Target: ${request.target}
🟡 Status: PROCESSING

━━━━━━━━━━━━━━━━━━

🔋 Sʏsᴛᴇᴍ Lᴏᴀᴅɪɴɢ...

[${bar}] ${percent}%

⏳ Processing...`
    );
  }

  await new Promise(
    resolve =>
      setTimeout(resolve, 500)
  );

  await ctx.telegram.editMessageText(
    request.userId,
    message.message_id,
    undefined,
`⚡ Sʏsᴛᴇᴍ Rᴇᴀᴅʏ

⚡ Bᴀɴ Eɴɢɪɴᴇ

🔄 Executing authorized action...

📱 Target: ${request.target}`
  );

  return message;
}

// ==================================================
// PROCESS APPROVED REQUEST
// ==================================================

async function processApprovedRequest(
  ctx,
  request
) {
  try {
    await progressAnimation(
      ctx,
      request
    );

    const result =
      await executeBanRequest(
        request
      );

    request.status =
      "COMPLETED";

    request.executionStatus =
      "EXECUTED";

    request.completedAt =
      now();

    saveRequest(
      request.id,
      request
    );

    // ----------------------------------------------
    // SAVE BAN GUARD RECORD
    // ----------------------------------------------

    if (
      request.service ===
      "whatsapp_ban"
    ) {
      saveBan(
        request.target,
        {
          phone: request.target,
          status: "BANNED",
          reason: request.reason,
          type: "Permanent",
          banAt: now(),
          requestId: request.id
        }
      );
    }

    if (
      request.service ===
      "whatsapp_unban"
    ) {
      saveBan(
        request.target,
        {
          phone: request.target,
          status: "UNBANNED",
          reason: request.reason,
          type: "Permanent Unban",
          banAt:
            request.banRecord?.banAt ||
            "Unknown",
          unbanAt: now(),
          requestId: request.id
        }
      );
    }

    addLog(
      "REQUEST_COMPLETED",
      {
        requestId: request.id,
        userId: request.userId,
        service: request.service,
        target: request.target,
        ownerId: request.approvedBy
      }
    );

    const finalStatus =
      request.service ===
      "whatsapp_unban"
        ? "🟢 Status: UNBANNED"
        : "🔴 Status: BANNED";

    const title =
      request.service ===
      "whatsapp_unban"
        ? "✅ Uɴʙᴀɴ Exᴇᴄᴜᴛᴇᴅ"
        : "✅ Bᴀɴ Exᴇᴄᴜᴛᴇᴅ";

    await ctx.telegram.sendMessage(
      request.userId,
`${title}

━━━━━━━━━━━━━━━━━━

📱 Phone: ${request.target}
${finalStatus}
📝 Reason: ${request.reason || "Not provided"}
⏳ Type: ${
  request.service === "whatsapp_unban"
    ? "Permanent Unban"
    : "Permanent"
}
🕐 ${
  request.service === "whatsapp_unban"
    ? `Ban at: ${
        request.banRecord?.banAt ||
        "Unknown"
      }\n🕐 Unban at: ${request.completedAt}`
    : `Ban at: ${request.completedAt}`
}

━━━━━━━━━━━━━━━━━━

🛡️ Bᴀɴ Gᴜᴀʀᴅ`
    );

    await ctx.reply(
`✅ Exᴇᴄᴜᴛɪᴏɴ Cᴏᴍᴘʟᴇᴛᴇ

🆔 ${request.id}
📱 ${request.target}

⚡ Action completed successfully.`
    );

  } catch (error) {
    console.error(
      "❌ Request execution error:",
      error
    );

    request.status =
      "EXECUTION_FAILED";

    request.executionStatus =
      "FAILED";

    request.error =
      error.message;

    request.failedAt =
      now();

    saveRequest(
      request.id,
      request
    );

    // ----------------------------------------------
    // REFUND
    // ----------------------------------------------

    changeBalance(
      request.userId,
      Number(request.price)
    );

    await ctx.telegram.sendMessage(
      request.userId,
`❌ Eɴɢɪɴᴇ Exᴇᴄᴜᴛɪᴏɴ Fᴀɪʟᴇᴅ

🆔 Request: ${request.id}

⚠️ ${error.message}

💰 Your reserved balance has been
returned.`
    );

    await ctx.reply(
`❌ Exᴇᴄᴜᴛɪᴏɴ Fᴀɪʟᴇᴅ

🆔 ${request.id}

${error.message}`
    );
  }
}

// ==================================================
// REJECT
// ==================================================

async function rejectCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const requestId = args[1];

  if (!requestId) {
    return ctx.reply(
      "❌ Usage:\n/reject REQUEST_ID"
    );
  }

  const request =
    getRequest(requestId);

  if (!request) {
    return ctx.reply(
      "❌ Request not found."
    );
  }

  request.status =
    "REJECTED";

  request.rejectedBy =
    userId(ctx);

  request.rejectedAt =
    now();

  saveRequest(
    request.id,
    request
  );

  await ctx.telegram.sendMessage(
    request.userId,
`❌ Rᴇǫᴜᴇsᴛ Rᴇᴊᴇᴄᴛᴇᴅ

🆔 ${request.id}
📱 Target: ${request.target}

👑 The owner rejected your request.`
  );

  return ctx.reply(
`❌ Rᴇǫᴜᴇsᴛ Rᴇᴊᴇᴄᴛᴇᴅ

🆔 ${request.id}`
  );
}

// ==================================================
// PREMIUM
// ==================================================

async function premiumCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const targetId = args[1];

  if (!targetId || !/^\d+$/.test(targetId)) {
    return ctx.reply(
      "❌ Usage:\n/premium USER_ID"
    );
  }

  setPremium(
    targetId,
    true
  );

  return ctx.reply(
`💎 Pʀᴇᴍɪᴜᴍ Gʀᴀɴᴛᴇᴅ

👤 User ID: ${targetId}
💎 Status: PREMIUM
💰 Price: FREE
👑 Granted by: Owner

✅ Premium access activated.`
  );
}

async function premiumOffCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const targetId = args[1];

  if (!targetId || !/^\d+$/.test(targetId)) {
    return ctx.reply(
      "❌ Usage:\n/premiumoff USER_ID"
    );
  }

  setPremium(
    targetId,
    false
  );

  return ctx.reply(
`🔴 Pʀᴇᴍɪᴜᴍ Rᴇᴍᴏᴠᴇᴅ

👤 User ID: ${targetId}
💎 Status: STANDARD`
  );
}

async function premiumInfoCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const targetId = args[1];

  if (!targetId) {
    return ctx.reply(
      "❌ Usage:\n/premiuminfo USER_ID"
    );
  }

  const user =
    getUser(targetId);

  return ctx.reply(
`💎 Pʀᴇᴍɪᴜᴍ Iɴғᴏ

🆔 User ID: ${targetId}
👤 User: ${user?.username || "Unknown"}
💎 Premium: ${
  isPremium(targetId)
    ? "YES"
    : "NO"
}
💰 Balance: ${money(
  user?.balance || 0
)}`
  );
}

async function premiumUsersCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  // Database structure may contain users as an object.
  const database =
    require("../database/database")
      .readDatabase();

  const users =
    database?.users || {};

  const premium =
    Object.values(users).filter(
      user =>
        user?.premium === true ||
        user?.isPremium === true
    );

  if (!premium.length) {
    return ctx.reply(
      "💎 No Premium users found."
    );
  }

  let text =
    "💎 Pʀᴇᴍɪᴜᴍ Uѕᴇʀs\n\n";

  for (const user of premium) {
    text +=
`👤 ${user.username || "User"}
🆔 ${user.id}
━━━━━━━━━━━━━━━━━━
`;
  }

  return ctx.reply(text);
}

// ==================================================
// CREDIT
// ==================================================

async function creditCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const targetId = args[1];
  const amount = Number(args[2]);

  if (
    !targetId ||
    !amount ||
    amount <= 0
  ) {
    return ctx.reply(
      "❌ Usage:\n/credit USER_ID AMOUNT"
    );
  }

  const balance =
    changeBalance(
      targetId,
      amount
    );

  return ctx.reply(
`💰 Bᴀʟᴀɴᴄᴇ Cʀᴇᴅɪᴛᴇᴅ

👤 User ID: ${targetId}
➕ Added: ${money(amount)}
💵 New Balance: ${money(balance)}`
  );
}

// ==================================================
// DEBIT
// ==================================================

async function debitCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const targetId = args[1];
  const amount = Number(args[2]);

  if (
    !targetId ||
    !amount ||
    amount <= 0
  ) {
    return ctx.reply(
      "❌ Usage:\n/debit USER_ID AMOUNT"
    );
  }

  const user =
    getUser(targetId) || {
      id: targetId,
      balance: 0
    };

  if (
    Number(user.balance || 0) <
    amount
  ) {
    return ctx.reply(
      "❌ User does not have enough balance."
    );
  }

  const balance =
    changeBalance(
      targetId,
      -amount
    );

  return ctx.reply(
`💰 Bᴀʟᴀɴᴄᴇ Dᴇʙɪᴛᴇᴅ

👤 User ID: ${targetId}
➖ Removed: ${money(amount)}
💵 New Balance: ${money(balance)}`
  );
}

// ==================================================
// USERS
// ==================================================

async function usersCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const database =
    require("../database/database")
      .readDatabase();

  const users =
    Object.values(
      database?.users || {}
    );

  return ctx.reply(
`👥 Uѕᴇʀ Sᴛᴀᴛɪsᴛɪᴄs

👤 Total Users: ${users.length}

💎 Premium Users: ${
  users.filter(
    u =>
      u?.premium === true ||
      u?.isPremium === true
  ).length
}`
  );
}

// ==================================================
// USER INFO
// ==================================================

async function userInfoCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const args = ctx.message.text
    .trim()
    .split(/\s+/);

  const targetId = args[1];

  if (!targetId) {
    return ctx.reply(
      "❌ Usage:\n/userinfo USER_ID"
    );
  }

  const user =
    getUser(targetId);

  if (!user) {
    return ctx.reply(
      "❌ User not found."
    );
  }

  return ctx.reply(
`👤 Uѕᴇʀ Iɴғᴏ

🆔 ID: ${targetId}
👤 Username: ${user.username || "Unknown"}
💰 Balance: ${money(user.balance)}
💎 Premium: ${
  isPremium(targetId)
    ? "YES"
    : "NO"
}`
  );
}

// ==================================================
// STATS
// ==================================================

async function statsCommand(ctx) {
  if (!(await ownerOnly(ctx))) {
    return;
  }

  const database =
    require("../database/database")
      .readDatabase();

  const users =
    Object.values(
      database?.users || {}
    );

  const requests =
    Object.values(
      database?.requests || {}
    );

  return ctx.reply(
`📊 Bᴀɴ Sʏsᴛᴇᴍ Sᴛᴀᴛs

👥 Users: ${users.length}
📋 Requests: ${requests.length}

⏳ Pending:
${
  requests.filter(
    r =>
      ![
        "COMPLETED",
        "REJECTED",
        "CANCELLED"
      ].includes(r.status)
  ).length
}

✅ Completed:
${
  requests.filter(
    r =>
      r.status === "COMPLETED"
  ).length
}

❌ Rejected:
${
  requests.filter(
    r =>
      r.status === "REJECTED"
  ).length
}`
  );
}

// ==================================================
// SERVICES
// ==================================================

async function servicesCommand(ctx) {
  return ctx.reply(
`🛡️ Sᴇʀᴠɪᴄᴇs

📱 WʜᴀᴛsAᴘᴘ

/ban PHONE
/unban PHONE

/bangroup GROUP_LINK
/unbangroup GROUP_LINK

/banchannel CHANNEL_LINK
/unbanchannel CHANNEL_LINK

✈️ Tᴇʟᴇɢʀᴀᴍ

/tgban USER_ID
/tgunban USER_ID

/tggroupban GROUP_ID
/tggroupunban GROUP_ID

/tgchannelban CHANNEL_ID
/tgchannelunban CHANNEL_ID

━━━━━━━━━━━━━━━━━━

⚠️ Requests require verification,
payment/balance and owner approval.`
  );
}

// ==================================================
// PRICE
// ==================================================

async function priceCommand(ctx) {
  return ctx.reply(
`💰 Pʀɪᴄɪɴɢ

👤 User Ban:
${money(config.prices.userBan)}

🔓 User Unban:
${money(config.prices.userUnban)}

👥 Group/Channel Ban:
${money(config.prices.groupChannelBan)}

🔓 Group/Channel Unban:
${money(config.prices.groupChannelUnban)}

🎁 Referral Reward:
${money(config.referral.reward)}`
  );
}

// ==================================================
// REGISTER
// ==================================================

function registerHandlers(bot) {

  // ----------------------------------------------
  // USER
  // ----------------------------------------------

  bot.start(startCommand);

  bot.command(
    "help",
    helpCommand
  );

  bot.command(
    "menu",
    startCommand
  );

  bot.command(
    "profile",
    profileCommand
  );

  bot.command(
    "id",
    idCommand
  );

  bot.command(
    "balance",
    balanceCommand
  );

  bot.command(
    "deposit",
    depositCommand
  );

  bot.command(
    "ban",
    banCommand
  );

  bot.command(
    "unban",
    unbanCommand
  );

  bot.command(
    "report",
    reportCommand
  );

  bot.command(
    "myrequests",
    myRequestsCommand
  );

  bot.command(
    "history",
    myRequestsCommand
  );

  bot.command(
    "status",
    statusCommand
  );

  bot.command(
    "cancel",
    cancelCommand
  );

  bot.command(
    "services",
    servicesCommand
  );

  bot.command(
    "price",
    priceCommand
  );

  // ----------------------------------------------
  // OWNER
  // ----------------------------------------------

  bot.command(
    "owner",
    ownerCommand
  );

  bot.command(
    "panel",
    ownerCommand
  );

  bot.command(
    "requests",
    requestsCommand
  );

  bot.command(
    "pending",
    pendingCommand
  );

  bot.command(
    "approve",
    approveCommand
  );

  bot.command(
    "reject",
    rejectCommand
  );

  bot.command(
    "premium",
    premiumCommand
  );

  bot.command(
    "premiumoff",
    premiumOffCommand
  );

  bot.command(
    "premiuminfo",
    premiumInfoCommand
  );

  bot.command(
    "premiumusers",
    premiumUsersCommand
  );

  bot.command(
    "credit",
    creditCommand
  );

  bot.command(
    "debit",
    debitCommand
  );

  bot.command(
    "users",
    usersCommand
  );

  bot.command(
    "userinfo",
    userInfoCommand
  );

  bot.command(
    "stats",
    statsCommand
  );

  // ----------------------------------------------
  // TEXT INPUT
  // ----------------------------------------------

  bot.on(
    "text",
    async ctx => {

      const id = userId(ctx);

      const state =
        waiting.get(id);

      if (!state) {
        return;
      }

      const request =
        getRequest(
          state.requestId
        );

      if (!request) {
        waiting.delete(id);

        return ctx.reply(
          "❌ Request no longer exists."
        );
      }

      if (
        state.type ===
        "reason"
      ) {
        request.reason =
          ctx.message.text.trim();

        request.status =
          "REPORT_PENDING";

        request.updatedAt =
          now();

        saveRequest(
          request.id,
          request
        );

        waiting.delete(id);

        return ctx.reply(
`${banGuard(request)}

━━━━━━━━━━━━━━━━━━

📊 5-report verification is required.

To submit a legitimate report/review
for this request, use:

/report ${request.id}

Each Telegram user can contribute
only once to the request.`
        );
      }
    }
  );

  // ----------------------------------------------
  // ERROR HANDLING
  // ----------------------------------------------

  bot.catch(
    (error, ctx) => {
      console.error(
        "❌ Telegram handler error:",
        error
      );

      try {
        ctx.reply(
          "❌ An unexpected error occurred. Please try again."
        );
      } catch {}
    }
  );
}

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  registerHandlers,
  processApprovedRequest
};
