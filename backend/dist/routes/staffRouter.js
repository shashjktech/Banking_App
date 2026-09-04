"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRouter = void 0;
const express_1 = require("express");
const auth_services_1 = require("../services/auth_services");
const middleware_1 = require("../middleware/middleware");
const auth_services_2 = require("../services/auth_services");
const auth_services_3 = require("../services/auth_services");
const AppError_1 = require("../error/AppError");
const auth_services_4 = require("../services/auth_services");
const transaction_service_1 = require("../services/transaction_service");
exports.staffRouter = (0, express_1.Router)();
exports.staffRouter.post('/login', async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        const result = await (0, auth_services_1.loginStaff)({ identifier, password });
        res.cookie('staffToken', result, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000, // 8 hours
        });
        res.status(200).json({
            success: true,
            message: 'Staff login successful',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.get('/profile', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const staffId = req.staff?.staffId;
        if (!staffId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const staffProfile = await (0, auth_services_2.getStaffProfile)(staffId);
        res.status(200).json({
            success: true,
            message: "Staff profile retrieved successfully",
            data: staffProfile,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.post('/logout', middleware_1.requireAuth, (req, res) => {
    res.clearCookie('staffToken');
    res.status(200).json({ success: true, message: 'Staff logged out successfully' });
});
exports.staffRouter.post('/create', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const { accountType, firstName, lastName, email, phoneNumber, address, initialDeposit, loanAmount, loanTerm } = req.body;
        // Extract staff ID from your auth middleware
        const staffId = req.staff?.staffId || req.user?.userId;
        if (!staffId) {
            throw new AppError_1.AppError(401, 'Unauthorized action');
        }
        if (!firstName || !lastName || !email || !accountType) {
            throw new AppError_1.AppError(400, 'Missing required fields (accountType, firstName, lastName, email)');
        }
        // Call your updated createAccount service with all required parameters
        const result = await (0, auth_services_1.createAccount)(staffId, accountType, firstName, lastName, email, phoneNumber, address, initialDeposit ? parseFloat(initialDeposit) : 0, loanAmount ? parseFloat(loanAmount) : 0, loanTerm ? parseInt(loanTerm) : 0);
        res.status(201).json({
            success: true,
            message: `${accountType} account created successfully`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.get('/customers', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const staffId = req.staff?.staffId;
        if (!staffId) {
            return res.status(401).json({ message: 'Unauthorized action' });
        }
        // Extract search, page, and limit from the query string
        const search = req.query.search;
        const page = parseInt(req.query.page) || 1;
        //const limit = parseInt(req.query.limit as string) || 10; 
        const result = await (0, auth_services_3.searchCustomers)(search, page, 10);
        res.status(200).json({
            success: true,
            message: 'Customers retrieved successfully',
            data: result.customers,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.get('/customer/:id', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const staffId = req.staff?.staffId;
        const page = parseInt(req.query.page) || 1;
        const result = await (0, auth_services_1.getCustomerProfile)(customerId, page, 10);
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.patch('/customers/:id/status', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const accountId = req.params.id;
        const { status } = req.body;
        // Extract logged-in staff ID from your auth middleware
        const staffId = req.staff?.staffId;
        if (!staffId) {
            throw new AppError_1.AppError(404, 'Unauthorized');
        }
        const updatedCustomer = await (0, auth_services_4.updateCustomerStatus)(accountId, status, staffId);
        res.status(200).json({
            success: true,
            message: 'Customer status updated successfully',
            data: updatedCustomer,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.post('/customers/:id/deposit', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const accountId = req.params.id;
        const staffId = req.staff?.staffId || req.user?.userId;
        const { amount, referenceNote } = req.body;
        if (!staffId)
            throw new AppError_1.AppError(401, 'Unauthorized');
        const result = await (0, transaction_service_1.processStaffDeposit)(accountId, Number(amount), staffId, referenceNote);
        res.status(200).json({ success: true, message: 'Deposit successful', data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.post('/customers/:id/withdraw', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const accountId = req.params.id;
        const staffId = req.staff?.staffId || req.user?.userId;
        const { amount, referenceNote } = req.body;
        if (!staffId)
            throw new AppError_1.AppError(401, 'Unauthorized');
        const result = await (0, transaction_service_1.processWithdrawal)(accountId, Number(amount), staffId, referenceNote);
        res.status(200).json({ success: true, message: 'Withdrawal successful', data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.post('/customers/:id/transfer', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const fromAccountId = req.params.id;
        const staffId = req.staff?.staffId || req.user?.userId;
        const { toAccountNumber, amount, referenceNote } = req.body;
        if (!staffId)
            throw new AppError_1.AppError(401, 'Unauthorized');
        if (!toAccountNumber)
            throw new AppError_1.AppError(400, 'Destination account number is required');
        const result = await (0, transaction_service_1.processTransfer)(fromAccountId, toAccountNumber, Number(amount), staffId, referenceNote);
        res.status(200).json({ success: true, message: 'Transfer successful', data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.get('/transactions', middleware_1.requireAuth, async (req, res, next) => {
    try {
        const staffId = req.staff?.staffId;
        if (!staffId)
            throw new AppError_1.AppError(401, 'Unauthorized');
        // Pass the entire query object to the service
        const result = await (0, transaction_service_1.getGlobalTransactions)(req.query);
        res.status(200).json({
            success: true,
            data: result.transactions,
            meta: result.meta
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffRouter.get('/loan/:accountId', middleware_1.requireAuth, async (req, res, next) => {
    try {
        //const userId = req.staff?.staffId as string; 
        const accountId = req.params.accountId;
        const loanData = await (0, auth_services_1.getLoanAccountDetails)(accountId);
        res.status(200).json({
            success: true,
            message: 'Loan details retrieved successfully',
            data: loanData
        });
    }
    catch (error) {
        next(error);
    }
});
