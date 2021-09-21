import express from 'express';
import { signUp, signIn, logout, logoutAll } from '../controllers/auth';
import { authUser } from '../middlewares/auth';

// eslint-disable-next-line new-cap
const authRouter = express.Router();

authRouter.post('/signUp', signUp);
authRouter.post('/signIn', signIn);
authRouter.get('/logout', authUser, logout);
authRouter.get('/logout/all', authUser, logoutAll);

export default authRouter;
