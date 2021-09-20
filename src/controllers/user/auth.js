import Boom from '@hapi/boom';
import User from '../../models/User';
import { ERROR_MESSAGES } from '../../utils/constants';
import { secureUserParams } from '../../utils/security';
import { asyncHandler } from '../../middlewares/asyncHandler';

export const signUp = asyncHandler(async (req, res, next) => {
    const { name, password, email } = req.body;
    try {
        if (!name) return res.boom.badData(ERROR_MESSAGES.userNameNotFound);

        if (!password)
            return res.boom.badData(ERROR_MESSAGES.userPasswordNotFound);

        if (!email) return res.boom.badData(ERROR_MESSAGES.userEmailNotFound);

        const user = new User({ name, password, email });
        await user.save();
        const token = await user.generateAuthToken();
        return res.status(200).json({ user: secureUserParams(user), token });
    } catch (e) {
        return next(res.json(Boom.badRequest(e.message).output.payload));
    }
});

export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return next(Boom.badData(ERROR_MESSAGES.userCredentialsNotFound));
        }
        const user = await User.findByCredentials(email, password);
        if (!user)
            return res.boom.unauthorized(ERROR_MESSAGES.invalidUserCredentials);

        const token = await user.generateAuthToken();
        return res.status(200).json({ user: secureUserParams(user), token });
    } catch (e) {
        return res.boom.unauthorized(e);
    }
});

export const logout = asyncHandler(async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token
        );
        await req.user.save();
        return res.status(200).json({});
    } catch (error) {
        return res.boom.internal(error);
    }
});
export const logoutAll = asyncHandler(async (req, res, next) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        return res.status(200).json({});
    } catch (error) {
        return res.boom.internal(error);
    }
});
