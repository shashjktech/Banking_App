import { env } from "../config/env";
import { StaffPayload, TokenPayLoad } from "../types/types";
import jwt,{SignOptions} from 'jsonwebtoken';
import { AppError } from "../error/AppError";

export function signAccessToken(payload: StaffPayload): string{
    const options: SignOptions = {
        expiresIn: env.jwt_expires_in as SignOptions['expiresIn']
    };
    return jwt.sign(payload, env.jwtsecret!, options);
}
export function verifyAccessToken(token: string): StaffPayload{
    try{
        return jwt.verify(token, env.jwtsecret!) as StaffPayload;
    }catch{
        throw new AppError(401, "Invalid token");
 
    }
}