const { json, readJson } = require('../_lib/http');
const { withStore, now } = require('../_lib/store');
const { verifyRefresh, signAccess } = require('../_lib/jwt');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

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

  const out = withStore((store) => {
    const row = store.refreshTokens.find(t => t.token === refreshToken);
    if (!row || row.revoked || row.expires_at < now()) return { ok: false, code: 401, error: 'رمز منتهي/ملغى' };

    const user = store.users.find(u => u.id === payload.sub);
    if (!user) return { ok: false, code: 401, error: 'مستخدم غير موجود' };

    const accessToken = signAccess(user);
    return { ok: true, code: 200, data: { accessToken } };
  });

  if (!out.ok) return json(res, out.code, { error: out.error });
  return json(res, 200, out.data);
};
