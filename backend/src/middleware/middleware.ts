import {Request, Response, NextFunction} from 'express';
import { AppError } from '../error/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = (req:Request, Res:Response, next: NextFunction)=>{
    const access_token = req.cookies?.staffToken;

    if(!access_token){
        return next(new AppError(401, 'Access Token require'));
    }

    const decoded = verifyAccessToken(access_token);
    req.staff=decoded;
    next();
}