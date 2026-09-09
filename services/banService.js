// services/banService.js

const {
  banWhatsAppUser,
  unbanWhatsAppUser,
  getWhatsAppBlockStatus
} = require("../whatsapp/ban");

// ==================================================
// WHATSAPP USER BAN
// ==================================================

async function executeWhatsAppUserBan(target) {
  if (!target) {
    throw new Error("WhatsApp target is required.");
  }

  const result = await banWhatsAppUser(target);

  return {
    success: true,
    service: "whatsapp_ban",
    action: "ban",
    target: result.phone,
    jid: result.jid
  };
}

// ==================================================
// WHATSAPP USER UNBAN
// ==================================================

async function executeWhatsAppUserUnban(target) {
  if (!target) {
    throw new Error("WhatsApp target is required.");
  }

  const result = await unbanWhatsAppUser(target);

  return {
    success: true,
    service: "whatsapp_unban",
    action: "unban",
    target: result.phone,
    jid: result.jid
  };
}

// ==================================================
// CHECK WHATSAPP BLOCK STATUS
// ==================================================

async function checkWhatsAppUser(target) {
  if (!target) {
    throw new Error("WhatsApp target is required.");
  }

  return await getWhatsAppBlockStatus(target);
}

// ==================================================
// EXECUTE REQUEST
// ==================================================

async function executeBanRequest(request) {
  if (!request) {
    throw new Error("Ban request is required.");
  }

  const {
    service,
    target
  } = request;

  switch (service) {
    case "whatsapp_ban":
      return await executeWhatsAppUserBan(target);

    case "whatsapp_unban":
      return await executeWhatsAppUserUnban(target);

    default:
      throw new Error(
        `Service "${service}" is not implemented yet.`
      );
  }
}

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  executeWhatsAppUserBan,
  executeWhatsAppUserUnban,
  checkWhatsAppUser,
  executeBanRequest
};
