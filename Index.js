const fs = require("fs");
const path = require("path");

// ==================================================
// BAN SYSTEM
// ==================================================

const BAN_FILE = path.join(__dirname, "bans.json");

// Create database if it doesn't exist
function ensureDatabase() {
if (!fs.existsSync(BAN_FILE)) {
fs.writeFileSync(BAN_FILE, "{}");
}
}

// Load bans
function loadBans() {
ensureDatabase();

try {
    return JSON.parse(
        fs.readFileSync(BAN_FILE, "utf8")
    );
} catch (error) {
    console.error("❌ Failed to read bans.json:", error);
    return {};
}

}

// Save bans
function saveBans(bans) {
fs.writeFileSync(
BAN_FILE,
JSON.stringify(bans, null, 2)
);
}

// ==================================================
// PHONE NUMBER
// ==================================================

function normalizePhone(phone) {
return String(phone)
.replace(/\D/g, "")
.replace(/^0+/, "");
}

// ==================================================
// PERMANENT BAN
// ==================================================

function banUser(
phone,
reason = "No reason provided"
) {
const number = normalizePhone(phone);

if (!number) {
    throw new Error("❌ Invalid phone number");
}

const bans = loadBans();
const now = new Date();

bans[number] = {
    phone: number,
    status: "BAN",
    reason: reason,
    type: "Permanent",
    bannedAt: now.toISOString(),
    expiresAt: null
};

saveBans(bans);

return bans[number];

}

// ==================================================
// TEMPORARY BAN
// ==================================================

function tempBanUser(
phone,
durationMs,
reason = "No reason provided"
) {
const number = normalizePhone(phone);

if (!number) {
    throw new Error("❌ Invalid phone number");
}

if (!durationMs || durationMs <= 0) {
    throw new Error("❌ Invalid ban duration");
}

const bans = loadBans();

const bannedAt = new Date();
const expiresAt = new Date(
    Date.now() + durationMs
);

bans[number] = {
    phone: number,
    status: "BAN",
    reason: reason,
    type: "Temporary",
    bannedAt: bannedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
};

saveBans(bans);

return bans[number];

}

// ==================================================
// CHECK BAN
// ==================================================

function getBan(phone) {
const number = normalizePhone(phone);
const bans = loadBans();

const ban = bans[number];

if (!ban) {
    return null;
}

// Permanent ban
if (ban.type === "Permanent") {
    return ban;
}

// Temporary ban
if (ban.type === "Temporary") {
    const expiry = new Date(
        ban.expiresAt
    ).getTime();

    // Still banned
    if (Date.now() < expiry) {
        return ban;
    }

    // Ban expired
    delete bans[number];
    saveBans(bans);

    return null;
}

return null;

}

// ==================================================
// IS BANNED
// ==================================================

function isBanned(phone) {
return getBan(phone) !== null;
}

// ==================================================
// UNBAN
// ==================================================

function unbanUser(phone) {
const number = normalizePhone(phone);
const bans = loadBans();

if (!bans[number]) {
    return false;
}

delete bans[number];

saveBans(bans);

return true;

}

// ==================================================
// FORMAT BAN INFORMATION
// ==================================================

function formatBan(phone) {
const ban = getBan(phone);

if (!ban) {
    return `✅ ${phone} is not banned.`;
}

const bannedAt = new Date(
    ban.bannedAt
).toLocaleString();

const expiresAt = ban.expiresAt
    ? new Date(
        ban.expiresAt
    ).toLocaleString()
    : "Never";

return `

🚫 ACCOUNT BANNED

📱 Phone: ${ban.phone}
🔴 Status: ${ban.status}
📝 Reason: ${ban.reason}
⏳ Type: ${ban.type}
🕐 Banned at: ${bannedAt}
⏰ Expires at: ${expiresAt}

👮 Admin
👇
🔎 Request Review
`.trim();
}

// ==================================================
// TEST
// ==================================================

// Permanent ban example:
//
// banUser(
//     "2348012345678",
//     "Age verification failure"
// );

// Temporary ban example:
//
// tempBanUser(
//     "2348012345678",
//     60 * 60 * 1000,
//     "Age verification failure"
// );

// Check:
//
// console.log(formatBan("2348012345678"));

// Unban:
//
// console.log(
//     unbanUser("2348012345678")
// );

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
banUser,
tempBanUser,
unbanUser,
isBanned,
getBan,
formatBan,
loadBans
};

// ==================================================
// START
// ==================================================

ensureDatabase();

console.log("🛡️ Ban System");
console.log("✅ Ban engine loaded");
console.log("💾 Database:", BAN_FILE);
