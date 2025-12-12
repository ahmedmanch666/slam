"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const db_1 = require("./db");
const auth_1 = require("./auth");
const crud_1 = require("./crud");
async function start() {
    const app = (0, fastify_1.default)({ logger: true });
    const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean) : true;
    await app.register(cors_1.default, { origin: corsOrigin, credentials: true });
    await app.register(rate_limit_1.default, { max: 100, timeWindow: '1 minute' });
    (0, db_1.initSchema)();
    await (0, auth_1.authRoutes)(app);
    await (0, crud_1.crudRoutes)(app);
    const port = Number(process.env.PORT || 3000);
    app.listen({ port, host: '0.0.0.0' }).then(() => {
        app.log.info(`Server running on http://localhost:${port}`);
    });
}
start().catch((err) => {
    console.error(err);
    process.exit(1);
});
