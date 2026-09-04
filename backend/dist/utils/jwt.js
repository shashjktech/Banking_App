"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const env_1 = require("../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../error/AppError");
function signAccessToken(payload) {
    const options = {
        expiresIn: env_1.env.jwt_expires_in
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtsecret, options);
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtsecret);
    }
    catch {
        throw new AppError_1.AppError(401, "Invalid token");
    }
}
