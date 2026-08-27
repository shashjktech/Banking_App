import cors from 'cors';
import express from 'express';
import { notFound } from './middleware/notFound';
import { errorHandler } from './error/errorHandler';
import { apiRouter } from './routes/apiRouter';
import cookieParser from 'cookie-parser';

export function creatApp(){
    const app = express();
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());


    // routes
    app.use("/bank", apiRouter);
    app.use(notFound);
    app.use(errorHandler)
    
    
    return app;

}

