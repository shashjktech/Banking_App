import { prisma } from "../utils/db";

import { User } from "@prisma/client";

export const findUserbyEmail = async (email: string): Promise<User | null> =>{
    return await prisma.user.findUnique({
        where:{email},
    });
};
export const findUserbyId = async (userId: string): Promise<User | null> =>{
    return await prisma.user.findUnique({
        where:{id: userId},
    });
};

export const createUser = async(userData: any): Promise<User> =>{
    return await prisma.user.create({
        data: userData,
    });
}