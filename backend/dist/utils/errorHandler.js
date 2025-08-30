"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "ValidationError",
            details: err.issues.map((i) => ({ path: i.path, message: i.message })),
        });
    }
    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ error: message });
}
