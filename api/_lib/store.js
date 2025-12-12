const fs = require('fs');
const path = require('path');

const STORE_PATH = process.env.STORE_PATH || path.join('/tmp', 'slam_store.json');

function now() { return Date.now(); }

function readStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('bad');
    data.users = Array.isArray(data.users) ? data.users : [];
    data.refreshTokens = Array.isArray(data.refreshTokens) ? data.refreshTokens : [];
    return data;
  } catch {
    return { users: [], refreshTokens: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function withStore(fn) {
  const store = readStore();
  const res = fn(store);
  writeStore(store);
  return res;
}

module.exports = { now, readStore, writeStore, withStore };
