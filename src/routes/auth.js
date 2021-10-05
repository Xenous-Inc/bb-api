import express from 'express';
import auth from '../controllers/auth';
import { authUser } from '../middlewares/auth';

// eslint-disable-next-line new-cap
const authRouter = express.Router();

authRouter.post('/phone/challenge', auth.phoneAuthChallenge);
authRouter.post('/phone', auth.phoneAuth);

authRouter.get('/logout', authUser, auth.logout);
authRouter.get('/logout/all', authUser, auth.logoutAll);

export default authRouter;
