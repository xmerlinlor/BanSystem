require("dotenv").config();

module.exports = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,

  ownerIds: [
    process.env.OWNER_ID_1,
    process.env.OWNER_ID_2
  ].filter(Boolean),

  payment: {
    bankName: "PalmPay",
    accountNumber: "8071569915",
    accountName: "Oghenerouna Emeri"
  },

  prices: {
    userBan: 500,
    userUnban: 300,
    groupChannelBan: 1000,
    groupChannelUnban: 600
  },

  referral: {
    reward: 100
  },

  settings: {
    maintenance: false,
    requireOwnerApproval: true
  }
};
