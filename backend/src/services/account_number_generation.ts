import { prisma } from "../utils/db";

export async function generateUniqueAccountNumber(tx: any): Promise<string>{
    let isUnique: boolean = false;
    let newAccountNumber: string='';

    while(!isUnique){
        newAccountNumber = Math.floor(1000000000 + Math.random()* 9000000000).toString();

        //check in database if that exists
        const existingAccount = await tx.account.findUnique({
            where: {accountNumber: newAccountNumber}
        });
        if(!existingAccount){
            isUnique = true;
        }
    }
    return newAccountNumber;
}