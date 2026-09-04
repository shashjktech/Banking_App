"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statuscode;
    constructor(statuscode, messege) {
        super(messege);
        this.statuscode = statuscode;
    }
}
exports.AppError = AppError;
