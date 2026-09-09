// whatsapp/connection.js

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const path = require("path");

const {
  setWhatsAppSocket
} = require("./ban");

// ==================================================
// SETTINGS
// ==================================================

const SESSION_DIR = path.join(
  __dirname,
  "session"
);

let sock = null;
let connecting = false;
let reconnectTimer = null;

// ==================================================
// LOGGER
// ==================================================

const logger = P({
  level: process.env.LOG_LEVEL || "info"
});

// ==================================================
// GET SOCKET
// ==================================================

function getWhatsAppSocket() {
  return sock;
}

// ==================================================
// CONNECTION STATUS
// ==================================================

function isConnected() {
  return !!(
    sock &&
    sock.user
  );
}

// ==================================================
// START WHATSAPP
// ==================================================

async function startWhatsApp() {
  if (connecting) {
    console.log(
      "⏳ WhatsApp connection is already starting..."
    );

    return sock;
  }

  connecting = true;

  try {
    const {
      state,
      saveCreds
    } = await useMultiFileAuthState(
      SESSION_DIR
    );

    sock = makeWASocket({
      auth: state,
      logger,

      printQRInTerminal: false,

      browser: [
        "BAN SYSTEM",
        "Chrome",
        "1.0.0"
      ],

      markOnlineOnConnect: false,

      generateHighQualityLinkPreview: false
    });

    // ==================================================
    // PASS SOCKET TO BAN SYSTEM
    // ==================================================

    setWhatsAppSocket(sock);

    // ==================================================
    // SAVE AUTH CREDENTIALS
    // ==================================================

    sock.ev.on(
      "creds.update",
      saveCreds
    );

    // ==================================================
    // CONNECTION UPDATE
    // ==================================================

    sock.ev.on(
      "connection.update",
      async (update) => {
        const {
          connection,
          lastDisconnect
        } = update;

        if (connection === "connecting") {
          console.log(
            "🔄 Connecting to WhatsApp..."
          );
        }

        if (connection === "open") {
          connecting = false;

          console.log(
            "✅ WhatsApp connected successfully."
          );

          setWhatsAppSocket(sock);
        }

        if (connection === "close") {
          connecting = false;

          const statusCode =
            lastDisconnect?.error?.output
              ?.statusCode;

          const shouldReconnect =
            statusCode !==
            DisconnectReason.loggedOut;

          console.log(
            `❌ WhatsApp connection closed. Code: ${
              statusCode || "unknown"
            }`
          );

          sock = null;

          setWhatsAppSocket(null);

          if (shouldReconnect) {
            console.log(
              "♻️ Reconnecting to WhatsApp..."
            );

            scheduleReconnect();
          } else {
            console.log(
              "🚪 WhatsApp session logged out."
            );
          }
        }
      }
    );

    return sock;

  } catch (error) {
    connecting = false;

    console.error(
      "❌ WhatsApp startup error:",
      error
    );

    sock = null;

    setWhatsAppSocket(null);

    scheduleReconnect();

    throw error;
  }
}

// ==================================================
// RECONNECT
// ==================================================

function scheduleReconnect() {
  if (reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(
    async () => {
      reconnectTimer = null;

      try {
        await startWhatsApp();
      } catch (error) {
        console.error(
          "❌ Reconnection failed:",
          error.message
        );
      }
    },
    5000
  );
}

// ==================================================
// LOGOUT
// ==================================================

async function logoutWhatsApp() {
  if (!sock) {
    return {
      success: false,
      message:
        "WhatsApp is not connected."
    };
  }

  try {
    await sock.logout();

    sock = null;

    setWhatsAppSocket(null);

    return {
      success: true
    };

  } catch (error) {
    console.error(
      "❌ WhatsApp logout error:",
      error.message
    );

    return {
      success: false,
      error: error.message
    };
  }
}

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  startWhatsApp,
  getWhatsAppSocket,
  isConnected,
  logoutWhatsApp
};
