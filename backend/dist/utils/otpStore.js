"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
// otp expires in 5 min and in 60 sec it will check the cache for clean up 
exports.otpCache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
