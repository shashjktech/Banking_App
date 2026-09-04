import {Router} from 'express';
//import { authRouter } from './authRouter';
import { staffRouter } from './staffRouter';

export const apiRouter = Router();
// differ routes


apiRouter.use('/staff', staffRouter);

