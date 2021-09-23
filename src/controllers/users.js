import { asyncHandler } from '../middlewares/asyncHandler';
import User from '../models/User';
import {secureSensorParams, secureUserParams} from '../utils/security';

export const readTokenOwner = asyncHandler((req, res) => {
    req.user.sensors.forEach((v, i) => req.user.sensors[i] = secureSensorParams(v));
    return res.status(200).json(buildSuccessResponseBody(secureUserParams(req.user)));
});

export const readOneById = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findOneByIdAndPopulateSensors(userId);

        if (!user) {
            throw new Error('User not found');
        }
        return res.status(200).json(buildSuccessResponseBody(secureUserParams(user)));
    } catch (e) {
        console.log(e);
        return res.boom.notFound(e.message);
    }
});


