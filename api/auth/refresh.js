const { json, readJson } = require('../_lib/http');
const { verifyRefresh, signAccess } = require('../_lib/jwt');
const { initDb, findRefreshToken, findUserById, now } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    await initDb();

    const body = await readJson(req);
    if (!body) return json(res, 400, { error: 'Invalid JSON' });

    const refreshToken = body.refreshToken;
    if (!refreshToken) return json(res, 400, { error: 'مفقود refreshToken' });

    let payload;
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      return json(res, 401, { error: 'فشل التحقق من الرمز' });
    }

    // Check token in database
    const row = await findRefreshToken(refreshToken);
    if (!row || row.revoked || row.expires_at < now()) {
      return json(res, 401, { error: 'رمز منتهي/ملغى' });
    }

    // Handle seeded admin
    if (payload.sub === 'seed_admin') {
      const seededUser = { id: 'seed_admin', email: 'admin@domain.com', role: 'admin' };
      const accessToken = signAccess(seededUser);
      return json(res, 200, { accessToken });
    }

    // Find user
    const user = await findUserById(payload.sub);
    if (!user) return json(res, 401, { error: 'مستخدم غير موجود' });

    const accessToken = signAccess(user);
    return json(res, 200, { accessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    return json(res, 500, { error: 'خطأ في الخادم' });
  }
};
