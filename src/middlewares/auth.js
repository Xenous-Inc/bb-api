import { asyncHandler } from './asyncHandler';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import Sensor from '../models/Sensor';

export const authUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const data = jwt.verify(token, process.env.JWT_KEY);
        if (!data._id) {
            throw new Error();
        }
        const user = await User.findOne({
            _id: data._id,
            'tokens.token': token,
        }).populate('sensors'); //TODO: Remove it later

        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.boom.unauthorized('Not access. Need authorized.');
    }
});

export const authSensor = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header('Sensor');
        const data = jwt.verify(token, process.env.JWT_KEY);
        if (!data._id) {
            throw new Error();
        }
        const sensor = await Sensor.findOne({
            _id: data._id,
            token: token,
        });
        if (!sensor) throw new Error();
        req.sensor = sensor;
        req.token = token;
        next();
    } catch (e) {
        return res.boom.unauthorized(
            'Not access. Sensor needs to be authorized'
        );
    }
});
