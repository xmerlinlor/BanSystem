const { Telegraf } = require("telegraf");
const config = require("../config");

if (!config.botToken) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing.");
}

const bot = new Telegraf(config.botToken);

module.exports = bot;
