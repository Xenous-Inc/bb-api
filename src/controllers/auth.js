import Boom from '@hapi/boom';
import User from '../models/User';
import { secureUserParams } from '../utils/security';
import { asyncHandler } from '../middlewares/asyncHandler';
import AuthChallengeModel from '../models/AuthChallenge';
import { sendPhoneVerify } from '../utils/phone';
import validator from 'validator';

const phoneAuthChallenge = asyncHandler(async (req, res, next) => {
    const { phoneNumber } = req.body;

    if (
        !phoneNumber ||
        !validator.isMobilePhone(phoneNumber, 'ru-RU', { strictMode: true })
    ) {
        return res.boom.badData('missing or wrong phone number');
    }

    try {
        const user = await User.findOne({ phoneNumber });

        const authChallenge = new AuthChallengeModel({
            phoneNumber,
            user: user ? user._id : null,
        });

        const challenge = await sendPhoneVerify(phoneNumber);

        authChallenge.phoneStatus = challenge.status;
        authChallenge.id = challenge.ucaller_id;
        authChallenge.code = challenge.code;
        authChallenge.phoneId = challenge.phone_id;
        await authChallenge.save();

        return res.status(200).json({
            challengeId: authChallenge._id,
            additionalDataRequired: !user,
        });
    } catch (e) {
        return next(res.json(Boom.badRequest(e.message).output.payload));
    }
});

const phoneAuth = asyncHandler(async (req, res, next) => {
    const { code, phoneNumber, challengeId, name, email } = req.body;

    try {
        const challenge = await AuthChallengeModel.findById(challengeId);
        if (!challenge)
            return res.boom.badData('missing or wrong challenge id');

        if (challenge.confirmed === true)
            return res.boom.badData('already confirmed');
        if (challenge.code !== code) return res.boom.badData('wrong code');
        if (challenge.phoneNumber !== phoneNumber)
            return res.boom.badData('wrong phone number');
        if (!challenge.user && !name && !email)
            return res.boom.badData('additional data required');

        const user = challenge.user
            ? await User.findOne({ phoneNumber })
            : await new User({ name, email, phoneNumber }).save();
        challenge.confirmed = true;
        await challenge.save();
        const token = await user.generateAuthToken();

        return res.status(200).json({ user: secureUserParams(user), token });
    } catch (e) {
        return next(res.json(Boom.badRequest(e.message).output.payload));
    }
});

const logout = asyncHandler(async (req, res, next) => {
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
const logoutAll = asyncHandler(async (req, res, next) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        return res.status(200).json({});
    } catch (error) {
        return res.boom.internal(error);
    }
});

export default {
    phoneAuth,
    phoneAuthChallenge,
    logout,
    logoutAll,
};
