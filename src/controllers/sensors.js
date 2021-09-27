import { asyncHandler } from '../middlewares/asyncHandler';
import User from '../models/User';
import Sensor from '../models/Sensor';
import { ERROR_MESSAGES, VALUE_TYPES } from '../utils/constants';
import { secureSensorParams, secureUserParams } from '../utils/security';
import { buildSuccessResponseBody } from '../utils/objects';

export const linkNewSensorWithUser = asyncHandler(async (req, res, next) => {
    const {
        name,
        model,
        version,
        firmwareVersion,
        location,
        settings,
        serialNumber,
    } = req.body;
    const user = req.user;

    // if (!name) return res.boom.badData(ERROR_MESSAGES.sensorNameNotFound);
    // if (!model) return res.boom.badData(ERROR_MESSAGES.sensorModelNotFound);
    // if (!version) return res.boom.badData(ERROR_MESSAGES.sensorVersionNotFound);
    // if (!firmwareVersion)
    //     return res.boom.badData(ERROR_MESSAGES.sensorFirmwareVersionNotFound);
    if (!location)
        return res.boom.badData(ERROR_MESSAGES.sensorLocationNotFound);

    try {
        const sensor = new Sensor({
            name,
            model,
            version,
            firmwareVersion,
            location,
            settings,
            owner: user._id,
        });
        await sensor.save();
        await sensor.generateAuthToken();

        await User.findByIdAndUpdate(user._id, { $push: { sensors: sensor } });
        sensor.owner = secureUserParams(user);
        return res.status(200).json(
            buildSuccessResponseBody({
                sensor: secureSensorParams(sensor),
                sensorToken: sensor.token,
            })
        );
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

export const readSensorById = asyncHandler(async (req, res, next) => {
    const { sensorId } = req.params;

    if (!sensorId) return res.boom.badData(ERROR_MESSAGES.sensorIdNotFound);
    try {
        const sensor = await Sensor.findOne({
            _id: sensorId,
        });
        if (!sensor) throw new Error('Sensor was not found in database');

        return res
            .status(200)
            .json(
                buildSuccessResponseBody({ sensor: secureSensorParams(sensor) })
            );
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

// TODO: Create update sensor

export const deleteSensorById = asyncHandler(async (req, res, next) => {
    const { sensorId } = req.params;
    const user = req.user;
    if (!sensorId) return res.boom.badData(ERROR_MESSAGES.sensorIdNotFound);
    try {
        await Sensor.findByIdAndDelete(sensorId);
        await User.findByIdAndUpdate(user._id, {
            sensors: req.user.sensors.filter((v) => v._id != sensorId),
        });

        return res.status(200).json(buildSuccessResponseBody());
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

// TODO: Remake with geo
export const readAllSensors = asyncHandler(async (req, res) => {
    try {
        const sensorsCollection = await Sensor.find({});
        let sensors = [];

        sensorsCollection.forEach((v) => {
            sensors = [...sensors, secureSensorParams(v)];
        });

        return res.status(200).json(buildSuccessResponseBody({ sensors }));
    } catch (e) {
        return res.boom.internal(e.message);
    }
});
