import { prisma } from "../utils/db";
import { AppError } from "../error/AppError";
import { loginPayload, RegisterUserPayload } from "../types/types";
import bcrypt from "bcryptjs";
import { arraySync } from "stream/iter";
import { generateUniqueAccountNumber } from "./account_number_generation";
import { NetworkResources } from "inspector/promises";
import { otpCache } from "../utils/otpStore";
import { verify } from "crypto";
import { sendOtpEmail } from "./email_service";
import { signAccessToken } from "../utils/jwt";
import { StaffLoginDTO } from "../types/types";
import { AccountType , AccountStatus} from "@prisma/client";


const FIXED_LOAN_INTEREST_RATE = 0.085;


// export const register = async(data: RegisterUserPayload) => {
//     const {email, password, confirmPassword, firstName, lastName, phoneNumber} = data;

//     const isVerified = otpCache.get(`verified_${email}`);
//     if(!isVerified){
//         throw new AppError(403, "Kindly, verify email to proceed!");
//     }

//     if(password !== confirmPassword){
//         throw new AppError(400, 'Password did not matched');
//     }
//     const existingUser = await findUserbyEmail(email);
//     if(existingUser){
//         throw new AppError(400, 'Customer already exists. Please Login');
//     }
//     const passwordHash = await bcrypt.hash(password, 10);

//     // now we will simultaneously we will add to user table and account table as well

//     //fetching that account type
//     const defaultAccountType = await prisma.accountType.findFirst({
//         where: {name: 'basic savings'},
//     });

//     if(!defaultAccountType){
//         throw new AppError(500, 'Default account type missing for system setup');
//     }
    

//     // create both user and account in one transaction
//     const newUser = await prisma.$transaction(async (tx) => {
//         const user = await tx.user.create({
//             data:{
//                 email,
//                 passwordHash,
//                 firstName,
//                 lastName,
//                 phoneNumber,
//             }
//         });

//         const safeAccountNumber  = await generateUniqueAccountNumber();
//         await tx.account.create({
//             data:{
//                 userId: user.id,
//                 accountTypeId: defaultAccountType.id,
//                 accountNumber: safeAccountNumber,
//             }
//         });
//         return user;
//     });
//     otpCache.del(`verified_${email}`);
//     return newUser;
    
// }

// export const requestOtp = async(email:string) => {
//     // generate otp
//     const otp = Math.floor(100000 + Math.random()* 900000).toString();

//     // store email:otp in cache memory
//     otpCache.set(email, otp);

//     //send the otp to mail
//     await sendOtpEmail(email, otp);
//     return {messege: 'OTP sent successfully to ' + email};

// }

// export const verifyOtp = async(email:string, providedOtp: string)=>{
//     const storedOtp = otpCache.get(email);

//     if(!storedOtp){
//         throw new AppError(400, 'Otp expired. Request for new Otp');
//     }
//     if(storedOtp !== providedOtp){
//         throw new AppError(400, 'INVALID otp');
//     }

//     // verified and empty the cache
//     otpCache.del(email);
//     otpCache.set(`verified_${email}`, true);

//     return{
//         messege: "Email verfied Successfully!"
//     }
// }
// export const loginUser = async(data: loginPayload)=>{
//     const {email, password} = data;

//     if(!email || !password){
//         throw new AppError(400, 'Both Email and Password are required');
//     }
//     const user = await findUserbyEmail(email);
//     if(!user){
//         throw new AppError(400, 'Invalid email or password');
//     }
//     const isValid = await bcrypt.compare(password, user.passwordHash);

//     if(!isValid){
//         throw new AppError(400, 'Incorrect password');
//     }

//     // do not generate jwt token
//     const otp = Math.floor(100000 + Math.random()* 900000).toString();
//     otpCache.set(`login_${email}`, otp);
//     await sendOtpEmail(email, otp);

//     return{
//         messege: "Credentials verified. Please check your email for OTP",
//         email: user.email
//     }

// }

// export const verifyLoginOtp = async(email: string, providedOtp: string)=>{
//     const storedOtp = otpCache.get(`login_${email}`);

//     if(!storedOtp){
//         throw new AppError(400, 'Otp expired. Request for new Otp');
//     }
//     if(storedOtp !== providedOtp){
//         throw new AppError(400, 'INVALID otp');
//     }

//     //otp valid del from cache
//     otpCache.del(`login_${email}`);

//     const user = await findUserbyEmail(email);
//     if (!user) {
//         throw new AppError(404, 'User not found');
//     }
//     const token = signAccessToken({userId: user.id});

//     return token;
// }

// export const getUserProfile = async(userId: string)=>{
//     const user = await findUserbyId(userId);
//     if (!user) {
//         throw new AppError(404 , 'User not found');
//     }
//     return user;
// };

// export const getAccountDetails = async(userId: string) =>{
//     const account = await prisma.account.findFirst({
//         where: {userId: userId},
//         include:{
//             accountType: true // joins AccountType table
//         }
//     });

//     if(!account){
//         throw new AppError(404, "No Account Found");
//     }
//     return account;

// }

export const loginStaff = async (data: StaffLoginDTO) => {
  const { identifier, password } = data;

  //  Validate required fields
  if (!identifier || !password) {
    throw new AppError(400, 'Username/Email and password are required');
  }

  //  Query Staff by username or email
  const staff = await prisma.staff.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });

  //  Check if staff exists and is active
  if (!staff || !staff.isActive) {
    throw new AppError(401, 'Invalid credentials or inactive account');
  }

  //  Verify password hash
  const isMatch = await bcrypt.compare(password, staff.passwordHash);
  if (!isMatch) {
    throw new AppError(401, 'Invalid credentials');
  }

  //  Generate Staff Access Token
  // If your signAccessToken utility expects userId, you can sign directly or pass staffId
  const token = signAccessToken({
    staffId: staff.id,
    role: staff.role,
  } as any);

//Record login event in AuditLog
  await prisma.auditlog.create({
    data: {
      staffId: staff.id,
      action: 'STAFF_LOGIN',
      targetEntity: 'Staff',
      targetId: staff.id,
      details: JSON.stringify({
        username: staff.username,
        role: staff.role,
        timestamp: new Date().toISOString()
      })
    }
  });
  return token;
}
export const getStaffProfile = async (staffId: string) => {
  if (!staffId) {
    throw new AppError(400, 'Staff ID is required');
  }

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      branch: {
        select: {
          id: true,
          name: true,
          branchcode: true,
          city: true,
          address: true,
        },
      }
    }
  });

  if (!staff) {
    throw new AppError(404, 'Staff member not found');
  }

  return staff;
};
export const createAccount = async(
  staffId: string,
  accountCategory: AccountType,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber?: string,
  address?: string,
  initialDeposit?: number,
  loanAmount?: number,
  loanTerm?: number,
)=>{
  
  const isLoan = accountCategory === "LOAN";

  if (isLoan) {
    if (!loanAmount || Number(loanAmount) <= 0) {
      throw new AppError(400, "Loan Principal Amount must be greater than zero.");
    }
    if (!loanTerm || Number(loanTerm) <= 0) {
      throw new AppError(400, "A valid loan term duration in months is required.");
    }
  }

  const startingBalance = isLoan
    ? Number(loanAmount)
    : initialDeposit && Number(initialDeposit) > 0
    ? Number(initialDeposit)
    : 0;

  // 2. Execute an atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    // A. Check if the customer already exists by email
    let customer = await tx.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Create a new customer if they don't exist
    if (!customer) {
      customer = await tx.customer.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phoneNumber: phoneNumber || null,
          address: address || null,
        },
      });
    }

    // B. Generate unique Account Number & Create the Account
    const accountNumber = await generateUniqueAccountNumber(tx);

    const account = await tx.account.create({
      data: {
        customerId: customer.id,
        accountNumber: accountNumber,
        accountType: accountCategory,
        balance: startingBalance,
        status: "ACTIVE",
      },
    });

    // C. Log Initial Deposit / Loan Disbursement Transaction (if amount > 0)
    if (startingBalance > 0) {
      await tx.transaction.create({
        data: {
          fromaccountId: null, // Null for initial funding / cash disbursement
          toaccountId: account.id, // Destination account
          staffId: staffId,
          type: isLoan ? "TRANSFER" : "DEPOSIT",
          amount: startingBalance,
          balanceAfter: startingBalance,
          status: "COMPLETED",
          referenceNote: isLoan
            ? `Loan Disbursement - Term: ${loanTerm} Months`
            : "Initial Opening Deposit",
        },
      });
    }

    // D. Create an Audit Log for tracking & compliance
    await tx.auditlog.create({
      data: {
        staffId: staffId,
        action: isLoan ? "LOAN_ACCOUNT_OPENED" : "ACCOUNT_OPENED",
        targetEntity: "account",
        targetId: account.id,
        details: isLoan
          ? `Disbursed ₹${startingBalance} loan to ${email} for ${loanTerm} months`
          : `Opened ${accountCategory} account for ${email} with deposit ₹${startingBalance}`,
      },
    });

    return { customer, account };
  });

  return result;
};
export const searchCustomers = async(searchQuery: string, page=1, limit=10)=>{
  let whereClause = {};

  if (searchQuery.trim()) {
    whereClause = {
      OR: [
        { firstName: { contains: searchQuery, mode: 'insensitive' } },
        { lastName: { contains: searchQuery, mode: 'insensitive' } },
        {
          accounts: {
            some: {
              accountNumber: { contains: searchQuery }
            }
          }
        }
      ]
    };
  }
  const skip = (page - 1) * limit;

  // Run both the data fetch and the count fetch concurrently
  const [customers, totalCount] = await prisma.$transaction([
    prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit, // Only take the limit (e.g., 10 records)
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        accounts: {
          select: {
            id: true,
            status: true,
            accountNumber: true, 
            accountType: true
          }
        }
      },
    }),
    prisma.customer.count({ where: whereClause }) // Get total matching rows
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    customers,
    meta: {
      totalCount,
      totalPages,
      currentPage: page,
      limit
    }
  }
}
export const getCustomerProfile = async(customerId: string, page:number, limit:number)=>{
    const skip = (page - 1) * limit;

    // Fetch customer profile
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new AppError(404,  'Customer not found' );
    }

    // Fetch customer accounts
    const accounts = await prisma.account.findMany({
      where: { customerId: customerId },
    });

    // Get account IDs for fetching transactions
    const accountIds = accounts.map(acc => acc.id);

    // Fetch paginated transactions for these accounts
    const [transactions, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: {
          OR: [
            { fromaccountId: { in: accountIds } },
            { toaccountId: { in: accountIds } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { fromaccountId: { in: accountIds } },
            { toaccountId: { in: accountIds } }
          ]
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    return{
      customer,
      accounts,
      transactions,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit
      }
    }
}
export const updateCustomerStatus = async(accountId: string, status: string, staffId:string)=>{
  
  const allowedStatuses = ['ACTIVE', 'FROZEN', 'CLOSED'];
    if (!status || !allowedStatuses.includes(status.toUpperCase())) {
      throw new AppError(404, 'Invalid Status');
    }
  const result = await prisma.$transaction(async (tx) => {
      
    //  Update the customer status in the database
      const customer = await tx.account.update({
        where: { id: accountId },
        data: { status: status.toUpperCase() as AccountStatus},
      });

      // B. Create a security audit log for bank compliance tracking
      await tx.auditlog.create({
        data: {
          staffId: staffId,
          action: 'CUSTOMER_STATUS_UPDATED',
          targetEntity: 'customer',
          targetId: accountId,
          details: `Staff member updated customer status to ${status.toUpperCase()}`,
        },
      });
    return customer;
  });
  return result;
}
export const getLoanAccountDetails = async (accountId: string) => {
    
    // 1. Fetch the account by ID only (staff can view all)
    const account = await prisma.account.findUnique({
        where: { id: accountId }, 
    });

    if (!account || account.accountType !== 'LOAN') {
        throw new AppError(404, 'Loan account not found or invalid account category.');
    }

    // 2. Find the initial disbursement transaction to extract the loan term
    const disbursementTx = await prisma.transaction.findFirst({
        where: { 
            toaccountId: account.id,
            type: 'TRANSFER' 
        },
        orderBy: { createdAt: 'asc' } 
    });

    // 3. Extract term from the referenceNote 
    let loanTermMonths = 12; // Fallback default
    if (disbursementTx && disbursementTx.referenceNote) {
        const match = disbursementTx.referenceNote.match(/Term:\s*(\d+)\s*Months/i);
        if (match && match[1]) {
            loanTermMonths = parseInt(match[1], 10);
        }
    }

    // 4. EMI Calculation
    const principal = Number(account.balance);
    const annualRate = 0.085; // Your FIXED_LOAN_INTEREST_RATE
    const monthlyRate = annualRate / 12;
    
    let emiAmount = 0;
    if (principal > 0 && monthlyRate > 0) {
        emiAmount = (principal * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    }

    return {
        ...account,
        loanDetails: {
            principalRemaining: principal,
            interestRate: annualRate * 100, 
            termMonths: loanTermMonths,
            emiAmount: emiAmount,
            disbursementDate: account.createdAt
        }
    };
};

 