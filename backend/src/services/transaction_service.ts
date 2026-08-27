import { prisma } from "../utils/db";
import { AppError } from "../error/AppError";
import PDFDocument from 'pdfkit';
import { Response } from "express";
import { log } from "node:console";

// export const transferFunds = async(senderUserId: string, toAccoundNumber:string, amount: number, referenceNote?: string) =>{
//     if (amount <= 0) throw new AppError(400, "Transfer amount must be greater than zero.");

//     const senderAccount = await prisma.account.findFirst({
//         where: {userId : senderUserId}
//     });
//     if (!senderAccount) throw new AppError(404, "Sender account not found.");
//     if (senderAccount.status !== 'ACTIVE') throw new AppError(403, "Your account is not active.");

//     const receiverAccount = await prisma.account.findUnique({
//         where: {accountNumber: toAccoundNumber},
//         include: {
//             user: true
//         }
//     });
//     if (!receiverAccount) throw new AppError(404, "Receiver account number is invalid.");
//     if (receiverAccount.status !== 'ACTIVE') throw new AppError(403, "Receiver account is not active.");

//     if (senderAccount.id === receiverAccount.id) throw new AppError(400, "You cannot transfer money to yourself.");
//     if (Number(senderAccount.balance) < amount) throw new AppError(400, "Insufficient funds.");
    
//     // Execute the Prisma Transaction 
//     const result = await prisma.$transaction(async(tx) =>{
        
//         const updatedSender = await tx.account.update({
//             where: {id: senderAccount.id},
//             data: {balance: {decrement: amount}}

//         });

//         await tx.account.update({
//             where: {id: receiverAccount.id},
//             data: { balance: {increment: amount}}
//         });

//         // record transaction
//         const transaction = await tx.transaction.create({
//             data:{
//                 fromAccountId: senderAccount.id,
//                 toAccountId: receiverAccount.id,
//                 amount: amount,
//                 type: 'TRANSFER',
//                 status: 'COMPLETED',
//                 referenceNote: referenceNote || null
//             }
//         });

//         // create log
//         await tx.transactionLog.create({
//             data:{
//                 transactionId: transaction.id,
//                 actionType: 'transfer_completed',
//                 actorId: senderUserId,
//                 newStatus: 'COMPLETED'
//             }
//         });
//         return {transaction, newBalance: updatedSender.balance};

//     })
//     return result;
// };

// export const getTransactionHistory = async(userId: string, page: number=1)=>{
//     const userAccount = await prisma.account.findFirst({
//         where: {userId}
//     });
//     if (!userAccount) throw new AppError(404, "Account not found.");

//     const limit = 10; // show 10 records
//     const skip = (page - 1)*limit // skip these records

//     const whereClause = {
//         OR: [
//                 {fromAccountId: userAccount.id},
//                 {toAccountId: userAccount.id}
//             ]
//     };

//     // Find all transactions where the user is sender or reciever
//     const [transactions, totalRecords] = await Promise.all([
//         prisma.transaction.findMany({
//             where: whereClause,
//             orderBy:{createdAt: 'desc'},
//             take: limit,
//             skip: skip
//         }),
//         prisma.transaction.count({
//             where: whereClause
//         })
//     ]);
//     const totalPages = Math.ceil(totalRecords/limit);

//     return {
//         transactions,
//         accountId: userAccount.id,
//         currentPage: page,
//         totalPages: totalPages
//     }

// }

// export const deposit = async(userId: string, amount: number, referenceNote?: string) => {
//     if (amount <= 0) throw new AppError(400, "Deposit amount must be greater than zero.");
//     // Find User's Account
//     const account = await prisma.account.findFirst({
//         where: {userId: userId},
//     });

//     if (!account) throw new AppError(404, "Account not found.");
//     if (account.status !== 'ACTIVE') throw new AppError(403, "Your account is not active.");

//     // start prisma transactions
//     const result = await prisma.$transaction(async(tx) => {
//         // add funds in the account
//         const updateAccount = await tx.account.update({
//             where: {id: account.id},
//             data:{balance:{increment: amount}}
//         });
//         // record transactions (set fromAccount == null)
//         const transaction = await tx.transaction.create({
//             data:{
//                 fromAccountId: null,
//                 toAccountId: account.id,
//                 amount: amount,
//                 type: 'DEPOSIT',
//                 status:'COMPLETED',
//                 referenceNote: referenceNote || 'ATM Deposit'
//             }
//         });
//         // create a transaction log
//         await tx.transactionLog.create({
//             data: {
//                 transactionId: transaction.id,
//                 actionType: 'deposit_complete',
//                 actorId: account.userId,
//                 newStatus: 'COMPLETED'
//             }
//         });
//         return { transaction, newBalance: updateAccount.balance };
//     });
//     return result;
// }

// export const generateStatementPDF = async(userId: string, res: Response)=>{
//     const user = await prisma.user.findUnique({
//         where:{id: userId},
//         include:{accounts:true}
//     });
//     if(!user || user.accounts.length === 0){
//         throw new AppError(404, "Account not found");
//     }

//     const account = user.accounts[0];
//     const transaction = await prisma.transaction.findMany({
//         where:{
//             OR:[{fromAccountId: account.id},
//                 {toAccountId: account.id}
//             ]
//         },
//         orderBy: {createdAt: 'desc'}
//     });
//     console.log(transaction);
    
//     const doc = new PDFDocument({margin: 50});
//     res.setHeader('Content-Type','application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=JKBank_Statement_${account.accountNumber}.pdf`)

//     // adding to res
//     doc.pipe(res);

//     doc.fontSize(20).text('JKbank. Official E-Statement', { align: 'center' });
//     doc.moveDown();

//     doc.fontSize(12).text(`Account Holder: ${user.firstName} ${user.lastName}`);
//     doc.text(`Account Number: ${account.accountNumber}`);
//     doc.text(`Current Balance: Rs. ${Number(account.balance).toFixed(2)}`);
//     doc.moveDown(2);

//     doc.fontSize(14).text('Transaction History:', { underline: true });
//     doc.moveDown();

//     // Loop through transactions
//     if(transaction.length === 0){
//         doc.fontSize(12).text('No recent transactions found.');
//     }else{
//         transaction.forEach((tx)=>{
//             const isSender = (tx.fromAccountId === account.id) || (tx.fromAccountId === null);
//             const symbol = isSender ? '-' : '+';
//             const date = new Date(tx.createdAt).toLocaleDateString();
                
//             doc.fontSize(10).text(
//                 `${date} | ${tx.type} | Amount: ${symbol}Rs. ${Number(tx.amount).toFixed(2)} | Note: ${tx.referenceNote || 'N/A'}`
//             );
//             doc.moveDown(0.5);
//         });

//     }
//     doc.end();
    
// }
export const processStaffDeposit = async(accountId: string, amount: number, staffId: string, referenceNote?: string) => {
    
    if (amount <= 0) throw new AppError(400, "Deposit amount must be greater than zero.");
    
    //  Find Account directly by Account ID (since Staff selects an account from the dashboard)
    const account = await prisma.account.findUnique({
        where: { id: accountId },
    });

    if (!account) throw new AppError(404, "Account not found.");
    if (account.status !== 'ACTIVE') throw new AppError(403, `Cannot deposit. Account is ${account.status}.`);

    //  Start atomic Prisma transaction
    const result = await prisma.$transaction(async(tx) => {
        
        //  Add funds using Prisma's atomic increment (Protects against race conditions)
        const updatedAccount = await tx.account.update({
            where: { id: account.id },
            data: { balance: { increment: amount } }
        });

        // B. Record the Transaction (linking it to the Staff member)
        const transaction = await tx.transaction.create({
            data: {
                fromaccountId: null,       // No sender account
                toaccountId: account.id,   // Receiver account
                staffId: staffId,          // NEW: Track the staff member who did this
                amount: amount,
                balanceAfter: updatedAccount.balance, // Store the snapshot balance
                type: 'DEPOSIT',
                status: 'COMPLETED',
                referenceNote: referenceNote || 'Branch Cash Deposit'
            }
        });
        await tx.auditlog.create({
            data: {
                staffId: staffId,
                action: 'DEPOSIT_PROCESSED',
                targetEntity: 'account',
                targetId: account.id,
                details: `Staff deposited ₹${amount} into account ${account.accountNumber}`
            }
        });

        return { transaction, newBalance: updatedAccount.balance };
    });

    return result;
}

export const processWithdrawal = async (accountId: string, amount: number, staffId: string, referenceNote?: string) => {
    if (amount <= 0) throw new AppError(400, 'Amount must be greater than zero');

    const result = await prisma.$transaction(async (tx) => {

        const account = await tx.account.findUnique({ where: { id: accountId } });
        if (!account) throw new AppError(404, 'Account not found');
        if (account.status !== 'ACTIVE') throw new AppError(400, `Cannot withdraw from ${account.status} account`);
        if (Number(account.balance) < amount) throw new AppError(400, 'Insufficient funds');

        const newBalance = Number(account.balance) - amount;

        const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
        });

        const transaction = await tx.transaction.create({
        data: {
            fromaccountId: accountId,
            staffId,
            type: 'WITHDRAWAL',
            amount,
            balanceAfter: newBalance,
            status: 'COMPLETED',
            referenceNote: referenceNote || 'Staff Withdrawal',
        },
        });

        await tx.auditlog.create({
        data: { staffId, action: 'WITHDRAWAL', targetEntity: 'account', targetId: accountId, details: `Withdrew ₹${amount}` },
        });

        return { account: updatedAccount, transaction };
    });
};

export const processTransfer = async (fromAccountId: string, toAccountNumber: string, amount: number, staffId: string, referenceNote?: string) => {
  if (amount <= 0) throw new AppError(400, 'Amount must be greater than zero');

  const result = await prisma.$transaction(async (tx) => {
        // Check Sender
        const sender = await tx.account.findUnique({ where: { id: fromAccountId } });
        if (!sender) throw new AppError(404, 'Sender account not found');
        if (sender.status !== 'ACTIVE') throw new AppError(400, 'Sender account is not active');
        if (Number(sender.balance) < amount) throw new AppError(400, 'Insufficient funds for transfer');

        // Check Receiver
        const receiver = await tx.account.findUnique({ where: { accountNumber: toAccountNumber } });
        
        if (!receiver) throw new AppError(404, 'Destination account not found');
        if (receiver.status !== 'ACTIVE') throw new AppError(400, 'Destination account is not active');
        if (sender.id === receiver.id) throw new AppError(400, 'Cannot transfer to the same account');

        const newSenderBalance = Number(sender.balance) - amount;
        const newReceiverBalance = Number(receiver.balance) + amount;

        // Update both balances
        const updatedSender = await tx.account.update({
        where: { id: sender.id },
        data: { balance: newSenderBalance },
        });

        await tx.account.update({
        where: { id: receiver.id },
        data: { balance: newReceiverBalance },
        });

        // Create Transfer Record
        const transaction = await tx.transaction.create({
        data: {
            fromaccountId: sender.id,
            toaccountId: receiver.id,
            staffId,
            type: 'TRANSFER',
            amount,
            balanceAfter: newSenderBalance, // Tracking sender's perspective balance
            status: 'COMPLETED',
            referenceNote: referenceNote || `Transfer to ${toAccountNumber}`,
        },
        });

        await tx.auditlog.create({
        data: { staffId, action: 'TRANSFER', targetEntity: 'account', targetId: sender.id, details: `Transferred ₹${amount} to ${toAccountNumber}` },
        });

        return { account: updatedSender, transaction };
  });
  return result;
};

export const getGlobalTransactions = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20; 
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (query.accountNumber) {
    whereClause.OR = [
      { fromaccount: { accountNumber: { contains: query.accountNumber } } }, // Lowercase 'a'
      { toAccount: { accountNumber: { contains: query.accountNumber } } }    // Uppercase 'A'
    ];
  }

  if (query.type) {
    whereClause.type = query.type.toUpperCase();
  }

  if (query.startDate || query.endDate) {
    whereClause.createdAt = {};
    if (query.startDate) {
      whereClause.createdAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999); 
      whereClause.createdAt.lte = end;
    }
  }

  const [transactions, totalCount] = await prisma.$transaction([
        prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
        include: {
            fromaccount: { select: { accountNumber: true } }, // Lowercase 'a'
            toAccount: { select: { accountNumber: true } },   // Uppercase 'A'
            staff: { select: { username: true } } 
        }
        }),
        prisma.transaction.count({ where: whereClause })
  ]);

  return {
    transactions,
    meta: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit
    }
  };
};





