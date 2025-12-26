const { json, readJson } = require('../_lib/http');
const { initDb, revokeRefreshToken } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    await initDb();

    const body = await readJson(req);
    if (!body) return json(res, 400, { error: 'Invalid JSON' });

    const refreshToken = body.refreshToken;
    if (!refreshToken) return json(res, 200, { ok: true });

    // Revoke token in database
    await revokeRefreshToken(refreshToken);

    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    return json(res, 500, { error: 'خطأ في الخادم' });
  }
};
