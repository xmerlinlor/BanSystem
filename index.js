require("dotenv").config();

const bot = require("./telegram/bot");
const { registerHandlers } = require("./telegram/handlers");
const {
  startWhatsApp
} = require("./whatsapp/connection");

// ==================================================
// REGISTER TELEGRAM HANDLERS
// ==================================================

registerHandlers(bot);

// ==================================================
// ERROR HANDLER
// ==================================================

bot.catch((error, ctx) => {
  console.error(
    `❌ Bot error for update ${ctx.update?.update_id}:`,
    error
  );
});

// ==================================================
// START SERVICES
// ==================================================

async function start() {
  try {
    // ----------------------------------------------
    // START WHATSAPP
    // ----------------------------------------------

    console.log(
      "🔄 Starting WhatsApp connection..."
    );

    await startWhatsApp();

    console.log(
      "📱 WhatsApp connection service started."
    );

    // ----------------------------------------------
    // START TELEGRAM
    // ----------------------------------------------

    await bot.launch();

    console.log(
      "🛡️ Ban System Telegram Bot is online."
    );

    console.log(
      "⚡ 𝐒𝐈𝐌𝐎𝐍 𝐓𝐄𝐂𝐇 × Dynasty"
    );

  } catch (error) {
    console.error(
      "❌ Failed to start Ban System:",
      error
    );

    process.exit(1);
  }
}

// ==================================================
// RUN
// ==================================================

start();

// ==================================================
// GRACEFUL SHUTDOWN
// ==================================================

process.once(
  "SIGINT",
  () => {
    console.log(
      "🛑 Stopping Ban System..."
    );

    bot.stop("SIGINT");
  }
);

process.once(
  "SIGTERM",
  () => {
    console.log(
      "🛑 Stopping Ban System..."
    );

    bot.stop("SIGTERM");
  }
);
