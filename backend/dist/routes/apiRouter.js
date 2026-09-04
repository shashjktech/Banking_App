"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
//import { authRouter } from './authRouter';
const staffRouter_1 = require("./staffRouter");
exports.apiRouter = (0, express_1.Router)();
// differ routes
exports.apiRouter.use('/staff', staffRouter_1.staffRouter);
