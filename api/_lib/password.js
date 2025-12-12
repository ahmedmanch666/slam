const crypto = require('crypto');

const ITERATIONS = 120000;
const KEYLEN = 32;
const DIGEST = 'sha256';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return `${ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [itersStr, salt, hash] = String(stored).split('$');
    const iters = Number(itersStr);
    if (!iters || !salt || !hash) return false;
    const cand = crypto.pbkdf2Sync(password, salt, iters, KEYLEN, DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(cand, 'hex'));
  } catch {
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
