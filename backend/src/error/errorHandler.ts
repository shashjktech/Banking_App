import { AppError } from "./AppError";
import { Request , Response, NextFunction} from "express";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void{
    if(err instanceof AppError){
         res.status(err.statuscode).json({
            success: false,
            messege: err.message
        })
        return;
    }

    res.status(500).json({
        success: false,
        messege: "Internal server error"
    });
    
}