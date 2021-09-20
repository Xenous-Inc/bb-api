import express from 'express';
import { readTokenOwner, readOneById } from '../controllers/user/read';
import { authUser } from '../middlewares/auth';

// eslint-disable-next-line new-cap
const userRouter = express.Router();

userRouter.get('/:userId', authUser, readOneById);
userRouter.get('/current', authUser, readTokenOwner);

export default userRouter;
