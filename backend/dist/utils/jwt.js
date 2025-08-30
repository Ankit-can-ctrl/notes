"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
function signJwt(user) {
    return jsonwebtoken_1.default.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
    }, JWT_SECRET, { expiresIn: "7d" });
}
function verifyJwt(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return {
            id: String(payload.sub),
            email: String(payload.email),
            name: String(payload.name),
        };
    }
    catch {
        return null;
    }
}
