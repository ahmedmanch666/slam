const jwt = require('jsonwebtoken');

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function signAccess(user) {
  const secret = mustEnv('JWT_ACCESS_SECRET');
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, secret, { expiresIn: ACCESS_TTL_SECONDS });
}

function signRefresh(user) {
  const secret = mustEnv('JWT_REFRESH_SECRET');
  return jwt.sign({ sub: user.id }, secret, { expiresIn: REFRESH_TTL_SECONDS });
}

function verifyRefresh(token) {
  const secret = mustEnv('JWT_REFRESH_SECRET');
  return jwt.verify(token, secret);
}

module.exports = {
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  signAccess,
  signRefresh,
  verifyRefresh
};
