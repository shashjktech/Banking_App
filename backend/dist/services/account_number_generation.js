"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueAccountNumber = generateUniqueAccountNumber;
async function generateUniqueAccountNumber(tx) {
    let isUnique = false;
    let newAccountNumber = '';
    while (!isUnique) {
        newAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        //check in database if that exists
        const existingAccount = await tx.account.findUnique({
            where: { accountNumber: newAccountNumber }
        });
        if (!existingAccount) {
            isUnique = true;
        }
    }
    return newAccountNumber;
}
