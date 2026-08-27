import NodeCache from 'node-cache';

// otp expires in 5 min and in 60 sec it will check the cache for clean up 
export const otpCache = new NodeCache({stdTTL: 300, checkperiod: 60})