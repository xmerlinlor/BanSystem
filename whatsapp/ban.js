// whatsapp/ban.js

let sock = null;

/**
 * Attach the active Baileys WhatsApp socket.
 *
 * Call this from your WhatsApp connection code once
 * the Baileys socket has been created.
 */
function setWhatsAppSocket(socket) {
  sock = socket;
}

/**
 * Make sure the WhatsApp connection exists.
 */
function requireSocket() {
  if (!sock) {
    throw new Error(
      "WhatsApp connection is not ready."
    );
  }

  return sock;
}

/**
 * Normalize a phone number.
 *
 * Example:
 * +234 801 234 5678
 * becomes:
 * 2348012345678
 */
function normalizePhone(phone) {
  return String(phone || "")
    .replace(/[^\d]/g, "");
}

/**
 * Convert a phone number to a WhatsApp JID.
 */
function phoneToJid(phone) {
  const number = normalizePhone(phone);

  if (!number) {
    throw new Error("Invalid phone number.");
  }

  return `${number}@s.whatsapp.net`;
}

/**
 * Block a WhatsApp contact.
 *
 * IMPORTANT:
 * This blocks the contact from the WhatsApp account
 * running the Baileys session.
 *
 * It globally ban the account from WhatsApp.
 */
async function banWhatsAppUser(phone) {
  const socket = requireSocket();
  const jid = phoneToJid(phone);

  await socket.updateBlockStatus(
    jid,
    "block"
  );

  return {
    success: true,
    phone: normalizePhone(phone),
    jid,
    action: "ban"
  };
}

/**
 * Unblock a WhatsApp contact.
 */
async function unbanWhatsAppUser(phone) {
  const socket = requireSocket();
  const jid = phoneToJid(phone);

  await socket.updateBlockStatus(
    jid,
    "unblock"
  );

  return {
    success: true,
    phone: normalizePhone(phone),
    jid,
    action: "unban"
  };
}

/**
 * Check whether a contact is currently blocked.
 */
async function getWhatsAppBlockStatus(phone) {
  const socket = requireSocket();
  const jid = phoneToJid(phone);

  /*
   * Baileys does not provide one universal
   * get-block-status call across all versions.
   *
   * Return the JID so the caller can maintain
   * the authoritative status in our database.
   */
  return {
    phone: normalizePhone(phone),
    jid,
    status: "UNKNOWN"
  };
}

module.exports = {
  setWhatsAppSocket,
  banWhatsAppUser,
  unbanWhatsAppUser,
  getWhatsAppBlockStatus,
  normalizePhone,
  phoneToJid
};
