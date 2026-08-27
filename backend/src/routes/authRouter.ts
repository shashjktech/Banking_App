// // auth routes
// import {Router} from 'express';
// //import { getAccountDetails, getUserProfile, loginUser, register, requestOtp, verifyLoginOtp, verifyOtp } from '../services/auth_services';
// import { AppError } from '../error/AppError';
// import { validateHeaderName } from 'http';
// import { requireAuth } from '../middleware/middleware';
// import { findUserbyEmail } from '../repositories/userRepository';
// import { deposit, generateStatementPDF, getTransactionHistory, transferFunds } from '../services/transaction_service';


// export const authRouter = Router();


// authRouter.post('/register', async(req, res, next)=>{
//     try{
//         const result = await register(req.body);

//         res.status(200).json({
//             success: true,
//             data: result,
//         });
//     }catch(error){
//         next(error)
//     }
// });

// authRouter.post('/register-send-otp', async(req, res, next)=>{
//     try{
//         const {email} = req.body;
//         if(!email){
//             throw new AppError(400, 'Email is Required');
//         }
//         const result = await requestOtp(email);
//         res.status(200).json(result);
//     }catch(error){
//         next(error);
//     }
// });

// authRouter.post('/register-verify-otp', async(req, res, next)=>{
//     try{
//         const {email, otp} = req.body;
//         if(!email || !otp){
//             throw new AppError(400, 'Email and Otp are required');
//         }
//         const result = await verifyOtp(email, otp);
//         res.status(200).json(result);
//     }catch(error){
//         next(error);
//     }
// });

// authRouter.post('/login', async (req, res, next)=>{
//     try{
//         const result = await loginUser(req.body);
//         res.status(200).json(result)
//     }catch(error){
//         next(error);
//     }
// });

// authRouter.post('/verify-login-otp', async (req, res, next)=>{
//     try {
//         const {email, otp} = req.body;
//         if(!email || !otp){
//             throw new AppError(400, 'Email and Otp are required');
//         }
//         const result = await verifyLoginOtp(email, otp);

//         res.cookie('token', result, {
//             httpOnly: true,
//             secure: false,
//             sameSite: 'strict',
//             maxAge: 10*60*1000 // 10 min expiry
//         });
        
        
//         res.status(200).json({
//             success: true,
//             data: result
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// authRouter.get('/profile', requireAuth ,async(req, res, next)=>{
//     try {
//         const userId = req.user.userId;
//         if(!userId){
//             res.status(401).json({
//                 messege: 'Unauthorized'
//             });
//             return;
//         }
//         const userProfile = await getUserProfile(userId);
//         const userAccount = await getAccountDetails(userId);
//         //const history = await getTransactionHistory(userId);

//         res.status(201).json({
//             messege: 'Profile retrieved successfully',
//             profile: userProfile,
//             account: userAccount,
//             //history: history
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// authRouter.post('/transfer', requireAuth, async(req, res, next) => {
//     try {
//         const userId = req.user.userId;
//         const { toAccountNumber, amount, referenceNote } = req.body;

//         const result = await transferFunds(userId, toAccountNumber, amount, referenceNote);

//         res.status(201).json({
//             status: true,
//             data: result
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// authRouter.post('/deposit', requireAuth, async(req, res, next) => {
//     try {
//         const userId = req.user.userId;
//         const { amount, referenceNote } = req.body;

//         if (!amount || isNaN(amount)) {
//             throw new AppError(400, "Valid deposit amount is required.");
//         }
//         const result = await deposit(userId, amount, referenceNote);

//         res.status(201).json({
//             success: true,
//             messege:'deposite successfull',
//             data: result
//         });

        
//     } catch (error) {
//         next(error);
//     }
// });

// authRouter.get('/statement', requireAuth, async(req, res, next)=>{
//     try {
//         const userId = req.user.userId;
//         await generateStatementPDF(userId, res);
//     } catch (error) {
//         next(error);
//     }
// })

// authRouter.get('/history', requireAuth, async(req, res, next)=>{
//     // we will look for query parameter in this /history?page=2
//     try {
//         const userId = req.user.userId;
//         // extract page
//         const page = parseInt(req.query.page as string) || 1;
//         const history = await getTransactionHistory(userId, page);
//         //console.log(history.totalPages);
        
//         res.status(201).json({
//             success: true,
//             messege: `History on ${page} fetched`,
//             data: history
//         });

//     } catch (error) {
//         next(error);
//     }
// })

