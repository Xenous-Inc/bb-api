import { asyncHandler } from '../../middlewares/asyncHandler';
import User from '../../models/User';
import { secureUserParams } from '../../utils/security';

export const readTokenOwner = asyncHandler((req, res) => {
    return res.status(200).json(secureUserParams(req.user));
});

export const readOneById = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({
            _id: userId,
        });
        if (!user) {
            throw new Error();
        }
        return res.status(200).json(secureUserParams(user));
    } catch (e) {
        return res.boom.notFound('User not found');
    }
});
