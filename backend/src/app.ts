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
        origin:[
            "http://localhost:5173",
            env.client_url
        ].filter(Boolean) as string[],
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

