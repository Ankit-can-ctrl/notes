"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
function requireAuth(req, res, next) {
    const authHeader = req.headers["authorization"] || "";
    const token = Array.isArray(authHeader)
        ? authHeader[0]?.split(" ")[1]
        : authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "MissingBearerToken" });
    }
    const user = (0, jwt_1.verifyJwt)(token);
    if (!user) {
        return res.status(401).json({ error: "InvalidOrExpiredToken" });
    }
    req.user = user;
    next();
}
