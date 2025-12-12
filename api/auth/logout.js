const { json, readJson } = require('../_lib/http');
const { withStore } = require('../_lib/store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const body = await readJson(req);
  if (!body) return json(res, 400, { error: 'Invalid JSON' });

  const refreshToken = body.refreshToken;
  if (!refreshToken) return json(res, 200, { ok: true });

  withStore((store) => {
    const row = store.refreshTokens.find(t => t.token === refreshToken);
    if (row) row.revoked = 1;
  });

  return json(res, 200, { ok: true });
};
