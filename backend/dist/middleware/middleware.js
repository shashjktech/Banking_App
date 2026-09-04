"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const AppError_1 = require("../error/AppError");
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, Res, next) => {
    const access_token = req.cookies?.staffToken;
    if (!access_token) {
        return next(new AppError_1.AppError(401, 'Access Token require'));
    }
    const decoded = (0, jwt_1.verifyAccessToken)(access_token);
    req.staff = decoded;
    next();
};
exports.requireAuth = requireAuth;
