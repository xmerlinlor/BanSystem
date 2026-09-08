const config = require("../config");

const channels = [
  {
    name: "Sɪᴍᴏɴ Tᴇᴄʜ 1",
    username: "@babyupdategc",
    link: "https://t.me/babyupdategc"
  },
  {
    name: "Sɪᴍᴏɴ Tᴇᴄʜ 2",
    username: "@missarcond",
    link: "https://t.me/missarcond"
  }
];

async function checkForceJoin(bot, userId) {
  const notJoined = [];

  for (const channel of channels) {
    try {
      const member = await bot.telegram.getChatMember(
        channel.username,
        userId
      );

      const allowed = [
        "member",
        "administrator",
        "creator"
      ].includes(member.status);

      if (!allowed) {
        notJoined.push(channel);
      }
    } catch (error) {
      console.error(
        `❌ Force Join check failed for ${channel.username}:`,
        error.message
      );

      notJoined.push(channel);
    }
  }

  return {
    joined: notJoined.length === 0,
    notJoined
  };
}

function forceJoinKeyboard(notJoined) {
  const buttons = notJoined.map((channel) => [
    {
      text: `📢 Jᴏɪɴ ${channel.name}`,
      url: channel.link
    }
  ]);

  buttons.push([
    {
      text: "✅ Cʜᴇᴄᴋ Aɢᴀɪɴ",
      callback_data: "check_force_join"
    }
  ]);

  return {
    inline_keyboard: buttons
  };
}

module.exports = {
  channels,
  checkForceJoin,
  forceJoinKeyboard
};
