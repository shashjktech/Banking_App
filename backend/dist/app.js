"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatApp = creatApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./error/errorHandler");
const apiRouter_1 = require("./routes/apiRouter");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
function creatApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, cors_1.default)({
        origin: [
            "http://localhost:5173",
            env_1.env.client_url
        ].filter(Boolean),
        credentials: true
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    //health checkup 
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy', uptime: process.uptime() });
    });
    // routes
    app.use("/bank", apiRouter_1.apiRouter);
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    return app;
}
