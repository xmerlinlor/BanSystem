const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

const defaultData = {
  users: {},
  requests: {},
  payments: {},
  referrals: {},
  bans: {},
  logs: {}
};

function ensureDatabase() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(defaultData, null, 2),
      "utf8"
    );
  }
}

function readDatabase() {
  ensureDatabase();

  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");

    if (!data.trim()) {
      return JSON.parse(JSON.stringify(defaultData));
    }

    return {
      ...defaultData,
      ...JSON.parse(data)
    };
  } catch (error) {
    console.error("❌ Database read error:", error.message);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function writeDatabase(data) {
  ensureDatabase();

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  return data;
}

function updateDatabase(callback) {
  const data = readDatabase();
  const updated = callback(data) || data;

  return writeDatabase(updated);
}

// ================================
// USERS
// ================================

function getUser(userId) {
  const data = readDatabase();
  return data.users[String(userId)] || null;
}

function saveUser(userId, userData = {}) {
  const data = readDatabase();
  const id = String(userId);

  data.users[id] = {
    ...(data.users[id] || {}),
    ...userData,
    userId: id,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);

  return data.users[id];
}

// ================================
// REQUESTS
// ================================

function getRequest(requestId) {
  const data = readDatabase();
  return data.requests[String(requestId)] || null;
}

function saveRequest(requestId, requestData = {}) {
  const data = readDatabase();
  const id = String(requestId);

  data.requests[id] = {
    ...(data.requests[id] || {}),
    ...requestData,
    id,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);

  return data.requests[id];
}

function getUserRequests(userId) {
  const data = readDatabase();
  const id = String(userId);

  return Object.values(data.requests).filter(
    (request) => String(request.userId) === id
  );
}

function getPendingRequests() {
  const data = readDatabase();

  return Object.values(data.requests).filter((request) =>
    [
      "PAYMENT_PENDING",
      "PAYMENT_PROOF_PENDING",
      "PENDING_OWNER_APPROVAL"
    ].includes(request.status)
  );
}

// ================================
// PAYMENTS
// ================================

function savePayment(paymentId, paymentData = {}) {
  const data = readDatabase();
  const id = String(paymentId);

  data.payments[id] = {
    ...(data.payments[id] || {}),
    ...paymentData,
    id,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);

  return data.payments[id];
}

function getPayment(paymentId) {
  const data = readDatabase();

  return data.payments[String(paymentId)] || null;
}

// ================================
// REFERRALS
// ================================

function saveReferral(referralId, referralData = {}) {
  const data = readDatabase();
  const id = String(referralId);

  data.referrals[id] = {
    ...(data.referrals[id] || {}),
    ...referralData,
    id,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);

  return data.referrals[id];
}

function getReferral(referralId) {
  const data = readDatabase();

  return data.referrals[String(referralId)] || null;
}

// ================================
// BAN RECORDS
// ================================

function saveBan(banId, banData = {}) {
  const data = readDatabase();
  const id = String(banId);

  data.bans[id] = {
    ...(data.bans[id] || {}),
    ...banData,
    id,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);

  return data.bans[id];
}

function getBan(banId) {
  const data = readDatabase();

  return data.bans[String(banId)] || null;
}

// ================================
// LOGS
// ================================

function addLog(logData = {}) {
  const data = readDatabase();

  const logId = `LOG-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;

  data.logs[logId] = {
    id: logId,
    ...logData,
    createdAt: new Date().toISOString()
  };

  writeDatabase(data);

  return data.logs[logId];
}

function getLogs() {
  const data = readDatabase();

  return Object.values(data.logs);
}

module.exports = {
  ensureDatabase,
  readDatabase,
  writeDatabase,
  updateDatabase,

  getUser,
  saveUser,

  getRequest,
  saveRequest,
  getUserRequests,
  getPendingRequests,

  savePayment,
  getPayment,

  saveReferral,
  getReferral,

  saveBan,
  getBan,

  addLog,
  getLogs
};
