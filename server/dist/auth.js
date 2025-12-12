"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
exports.requireAuth = requireAuth;
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const node_crypto_1 = require("crypto");
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_ACCESS';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_REFRESH';
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('البريد غير صالح'),
    password: zod_1.z.string().min(8, 'كلمة المرور قصيرة'),
    role: zod_1.z.enum(['admin', 'user']).default('user')
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('البريد غير صالح'),
    password: zod_1.z.string().min(8, 'كلمة المرور قصيرة')
});
function signAccess(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, role: user.role, email: user.email }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
function signRefresh(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
async function authRoutes(app) {
    app.post('/auth/register', async (req, reply) => {
        try {
            const parsed = registerSchema.parse(req.body);
            const userCount = db_1.db.prepare('SELECT COUNT(*) AS c FROM users').get();
            const isFirstUser = userCount.c === 0;
            const role = isFirstUser && !req.body.role ? 'admin' : parsed.role;
            if (!isFirstUser && role === 'admin') {
                return reply.code(403).send({ error: 'غير مسموح بإنشاء مدير جديد' });
            }
            const id = globalThis.crypto?.randomUUID?.() || (0, node_crypto_1.randomUUID)();
            const hash = bcryptjs_1.default.hashSync(parsed.password, 12);
            db_1.db.prepare('INSERT INTO users (id,email,password_hash,role,created_at) VALUES (?,?,?,?,?)')
                .run(id, parsed.email, hash, role, (0, db_1.now)());
            return reply.send({ ok: true });
        }
        catch (e) {
            return reply.code(400).send({ error: e?.message || 'فشل التحقق من البيانات' });
        }
    });
    app.post('/auth/login', async (req, reply) => {
        try {
            const body = loginSchema.parse(req.body);
            const row = db_1.db.prepare('SELECT id,email,password_hash,role FROM users WHERE email = ?').get(body.email);
            if (!row)
                return reply.code(401).send({ error: 'بيانات الدخول غير صحيحة' });
            if (!bcryptjs_1.default.compareSync(body.password, row.password_hash))
                return reply.code(401).send({ error: 'بيانات الدخول غير صحيحة' });
            const access = signAccess(row);
            const refresh = signRefresh(row);
            db_1.db.prepare('INSERT INTO refresh_tokens (token,user_id,expires_at,revoked) VALUES (?,?,?,0)').run(refresh, row.id, (0, db_1.now)() + REFRESH_TTL_MS);
            return reply.send({ accessToken: access, refreshToken: refresh, role: row.role });
        }
        catch (e) {
            return reply.code(400).send({ error: e?.message || 'فشل التحقق من البيانات' });
        }
    });
    app.post('/auth/refresh', async (req, reply) => {
        const { refreshToken } = req.body || {};
        if (!refreshToken)
            return reply.code(400).send({ error: 'مفقود refreshToken' });
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
            const row = db_1.db.prepare('SELECT token,user_id,expires_at,revoked FROM refresh_tokens WHERE token = ?').get(refreshToken);
            if (!row || row.revoked || row.expires_at < (0, db_1.now)())
                return reply.code(401).send({ error: 'رمز منتهي/ملغى' });
            const user = db_1.db.prepare('SELECT id,email,role FROM users WHERE id = ?').get(payload.sub);
            if (!user)
                return reply.code(401).send({ error: 'مستخدم غير موجود' });
            const newAccess = signAccess(user);
            return reply.send({ accessToken: newAccess });
        }
        catch (e) {
            return reply.code(401).send({ error: 'فشل التحقق من الرمز' });
        }
    });
    app.post('/auth/logout', async (req, reply) => {
        const { refreshToken } = req.body || {};
        if (refreshToken) {
            db_1.db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(refreshToken);
        }
        return reply.send({ ok: true });
    });
}
function requireAuth(req, reply) {
    const hdr = req.headers['authorization'];
    if (!hdr)
        return reply.code(401).send({ error: 'مطلوب تسجيل الدخول' });
    const [, token] = hdr.split(' ');
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
        req.user = payload;
    }
    catch {
        return reply.code(401).send({ error: 'رمز وصول غير صالح' });
    }
}
