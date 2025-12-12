const crypto = require('crypto');
const { json, readJson } = require('../_lib/http');
const { withStore, now } = require('../_lib/store');
const { verifyPassword } = require('../_lib/password');
const { signAccess, signRefresh, REFRESH_TTL_SECONDS } = require('../_lib/jwt');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const body = await readJson(req);
  if (!body) return json(res, 400, { error: 'Invalid JSON' });

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !email.includes('@')) return json(res, 400, { error: 'البريد غير صالح' });
  if (password.length < 8) return json(res, 400, { error: 'كلمة المرور قصيرة' });

  const out = withStore((store) => {
    const user = store.users.find(u => u.email === email);
    if (!user) return { ok: false, code: 401, error: 'بيانات الدخول غير صحيحة' };
    if (!verifyPassword(password, user.password_hash)) return { ok: false, code: 401, error: 'بيانات الدخول غير صحيحة' };

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    store.refreshTokens.push({
      token: refreshToken,
      user_id: user.id,
      expires_at: now() + REFRESH_TTL_SECONDS * 1000,
      revoked: 0
    });

    return { ok: true, code: 200, data: { accessToken, refreshToken, role: user.role } };
  });

  if (!out.ok) return json(res, out.code, { error: out.error });
  return json(res, 200, out.data);
};
