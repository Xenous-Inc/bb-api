import express from 'express';
import { readTokenOwner, readOneById } from '../controllers/users';
import { authUser } from '../middlewares/auth';

// eslint-disable-next-line new-cap
const userRouter = express.Router();

userRouter.get('/:userId', authUser, readOneById);
userRouter.get('/', authUser, readTokenOwner);

export default userRouter;
