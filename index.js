require("dotenv").config();

const bot = require("./telegram/bot");
const { registerHandlers } = require("./telegram/handlers");

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
// START BOT
// ==================================================

bot.launch()
  .then(() => {
    console.log("🛡️ Ban System Telegram Bot is online.");
    console.log("⚡ 𝐒𝐈𝐌𝐎𝐍 𝐓𝐄𝐂𝐇 × Dynasty");
  })
  .catch((error) => {
    console.error("❌ Failed to start Telegram bot:", error);
    process.exit(1);
  });

// ==================================================
// GRACEFUL SHUTDOWN
// ==================================================

process.once("SIGINT", () => {
  console.log("🛑 Stopping Telegram bot...");
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  console.log("🛑 Stopping Telegram bot...");
  bot.stop("SIGTERM");
});
