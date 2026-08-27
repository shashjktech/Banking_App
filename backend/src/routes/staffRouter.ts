import { Router } from "express";
import { createAccount, getCustomerProfile, getLoanAccountDetails, loginStaff } from "../services/auth_services";
import { requireAuth } from "../middleware/middleware";
import { getStaffProfile } from "../services/auth_services";
import { searchCustomers } from "../services/auth_services";
import { AppError } from "../error/AppError";
import { updateCustomerStatus } from "../services/auth_services";
import { getGlobalTransactions, processStaffDeposit, processTransfer, processWithdrawal } from "../services/transaction_service";

export const staffRouter = Router();

staffRouter.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await loginStaff({identifier, password});

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
  } catch (error) {
    next(error);
  }
});

staffRouter.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const staffId = req.staff?.staffId;

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const staffProfile = await getStaffProfile(staffId);

    res.status(200).json({
      success: true,
      message: "Staff profile retrieved successfully",
      data: staffProfile,
    });
  } catch (error) {
    next(error);
  }
});

staffRouter.post('/logout', requireAuth, (req, res) => {
  res.clearCookie('staffToken');
  res.status(200).json({ success: true, message: 'Staff logged out successfully' });
});

staffRouter.post('/create', requireAuth, async(req, res, next)=>{
    try {
      const { 
      accountType, 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      address, 
      initialDeposit, 
      loanAmount, 
      loanTerm 
    } = req.body;
    
    // Extract staff ID from your auth middleware
    const staffId = req.staff?.staffId || req.user?.userId;

    if (!staffId) {
      throw new AppError(401, 'Unauthorized action');
    }

    if (!firstName || !lastName || !email || !accountType) {
      throw new AppError(400, 'Missing required fields (accountType, firstName, lastName, email)');
    }

    // Call your updated createAccount service with all required parameters
    const result = await createAccount(
      staffId,
      accountType,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      initialDeposit ? parseFloat(initialDeposit) : 0,
      loanAmount ? parseFloat(loanAmount) : 0,
      loanTerm ? parseInt(loanTerm) : 0
    );

    res.status(201).json({
      success: true,
      message: `${accountType} account created successfully`,
      data: result,
    });
  } catch (error) {
      next(error);
  }
})

staffRouter.get('/customers', requireAuth, async (req, res, next) => {
  try {
    const staffId = req.staff?.staffId 
    if (!staffId) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    // Extract search, page, and limit from the query string
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    //const limit = parseInt(req.query.limit as string) || 10; 

    const result = await searchCustomers(search, page, 10);

    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result.customers,
      meta: result.meta, 
    });
  } catch (error) {
    next(error);
  }
});

staffRouter.get('/customer/:id', requireAuth, async(req, res, next)=>{
  try {
    const customerId = req.params.id as string;
    const staffId = req.staff?.staffId;
    const page = parseInt(req.query.page as string) || 1;

    const result = await getCustomerProfile(customerId, page, 10);
    res.status(201).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

staffRouter.patch('/customers/:id/status', requireAuth, async (req, res, next) => {
  try {
    const accountId = req.params.id as string;
    const { status } = req.body;
    
    // Extract logged-in staff ID from your auth middleware
    const staffId = req.staff?.staffId;

    if (!staffId) {
      throw new AppError(404, 'Unauthorized')
    }
    const updatedCustomer = await updateCustomerStatus(accountId, status, staffId);
    res.status(200).json({
      success: true,
      message: 'Customer status updated successfully',
      data: updatedCustomer,
    });


  } catch (error) {    
    next(error);
  }
});
staffRouter.post('/customers/:id/deposit', requireAuth, async (req, res, next)=>{
  try {
    const accountId = req.params.id as string;
    const staffId = req.staff?.staffId || req.user?.userId;
    const { amount, referenceNote } = req.body;

    if (!staffId) throw new AppError(401, 'Unauthorized');

    const result = await processStaffDeposit(accountId, Number(amount), staffId, referenceNote);
    
    res.status(200).json({ success: true, message: 'Deposit successful', data: result });
  } catch (error) {
    next(error);
  }
})

staffRouter.post('/customers/:id/withdraw', requireAuth, async (req, res, next) => {
  try {
    const accountId = req.params.id as string;
    const staffId = req.staff?.staffId || req.user?.userId;
    const { amount, referenceNote } = req.body;

    if (!staffId) throw new AppError(401, 'Unauthorized');

    const result = await processWithdrawal(accountId, Number(amount), staffId, referenceNote);
    
    res.status(200).json({ success: true, message: 'Withdrawal successful', data: result });
  } catch (error) {
    next(error);
  }
});

staffRouter.post('/customers/:id/transfer', requireAuth, async (req, res, next) => {
  try {
    const fromAccountId = req.params.id as string;
    const staffId = req.staff?.staffId || req.user?.userId;
    const { toAccountNumber, amount, referenceNote } = req.body;

    if (!staffId) throw new AppError(401, 'Unauthorized');
    if (!toAccountNumber) throw new AppError(400, 'Destination account number is required');

    const result = await processTransfer(fromAccountId, toAccountNumber, Number(amount), staffId, referenceNote);
    
    res.status(200).json({ success: true, message: 'Transfer successful', data: result });
  } catch (error) {
    next(error);
  }
});

staffRouter.get('/transactions', requireAuth, async (req, res, next) => {
  try {
    const staffId = req.staff?.staffId
    if (!staffId) throw new AppError(401, 'Unauthorized');

    // Pass the entire query object to the service
    const result = await getGlobalTransactions(req.query);

    res.status(200).json({
      success: true,
      data: result.transactions,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
});
staffRouter.get('/loan/:accountId', requireAuth, async (req, res, next) => {
    try {
        //const userId = req.staff?.staffId as string; 
        const accountId = req.params.accountId as string;
        
        const loanData = await getLoanAccountDetails(accountId);
        
        res.status(200).json({
            success: true,
            message: 'Loan details retrieved successfully',
            data: loanData
        });
    } catch (error) {
        next(error);
    }
});


