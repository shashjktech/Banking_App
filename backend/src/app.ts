import cors from 'cors';
import express from 'express';
import { notFound } from './middleware/notFound';
import { errorHandler } from './error/errorHandler';
import { apiRouter } from './routes/apiRouter';
import cookieParser from 'cookie-parser';
import { env } from './config/env';

export function creatApp(){
    const app = express();
    app.set('trust proxy', 1);
    app.use(cors({
        origin:"https://project-242bd360-d8b9-4aad-9e6.web.app/",
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    //health checkup 
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy', uptime: process.uptime() });
    });


    // routes
    app.use("/bank", apiRouter);
    app.use(notFound);
    app.use(errorHandler)
    
    
    return app;

}

