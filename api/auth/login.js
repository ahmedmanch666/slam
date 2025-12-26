const { json, readJson } = require('../_lib/http');
const { verifyPassword } = require('../_lib/password');
const { signAccess, signRefresh, REFRESH_TTL_SECONDS } = require('../_lib/jwt');
const { initDb, findUserByEmail, saveRefreshToken, now } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    // Initialize database on first request
    await initDb();

    const body = await readJson(req);
    if (!body) return json(res, 400, { error: 'Invalid JSON' });

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    // Seeded admin login (fallback when no users exist)
    if (email === 'admin@domain.com' && password === '12345678') {
      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        return json(res, 500, { error: 'Missing JWT secrets (JWT_ACCESS_SECRET / JWT_REFRESH_SECRET)' });
      }
      console.log('seeded admin login', { email });
      const seededUser = { id: 'seed_admin', email: 'admin@domain.com', role: 'admin' };
      const accessToken = signAccess(seededUser);
      const refreshToken = signRefresh(seededUser);

      // Store refresh token for seeded admin
      await saveRefreshToken({
        token: refreshToken,
        user_id: seededUser.id,
        expires_at: now() + REFRESH_TTL_SECONDS * 1000
      });

      return json(res, 200, { accessToken, refreshToken, role: 'admin', email: 'admin@domain.com' });
    }

    if (!email || !email.includes('@')) return json(res, 400, { error: 'البريد غير صالح' });
    if (password.length < 8) return json(res, 400, { error: 'كلمة المرور قصيرة' });

    // Find user in database
    const user = await findUserByEmail(email);
    if (!user) return json(res, 401, { error: 'بيانات الدخول غير صحيحة' });
    if (!verifyPassword(password, user.password_hash)) return json(res, 401, { error: 'بيانات الدخول غير صحيحة' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    // Store refresh token
    await saveRefreshToken({
      token: refreshToken,
      user_id: user.id,
      expires_at: now() + REFRESH_TTL_SECONDS * 1000
    });

    return json(res, 200, { accessToken, refreshToken, role: user.role, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    return json(res, 500, { error: 'خطأ في الخادم' });
  }
};
