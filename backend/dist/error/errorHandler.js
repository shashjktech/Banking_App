"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("./AppError");
function errorHandler(err, req, res, next) {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statuscode).json({
            success: false,
            messege: err.message
        });
        return;
    }
    res.status(500).json({
        success: false,
        messege: "Internal server error"
    });
}
