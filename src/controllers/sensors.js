import { asyncHandler } from '../middlewares/asyncHandler';
import User from '../models/User';
import Sensor from '../models/Sensor';
import { ERROR_MESSAGES } from '../utils/constants';
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

    if (!name) return res.boom.badData(ERROR_MESSAGES.sensorNameNotFound);
    if (!model) return res.boom.badData(ERROR_MESSAGES.sensorModelNotFound);
    if (!version) return res.boom.badData(ERROR_MESSAGES.sensorVersionNotFound);
    if (!firmwareVersion)
        return res.boom.badData(ERROR_MESSAGES.sensorFirmwareVersionNotFound);
    if (!serialNumber)
        return res.boom.badData(ERROR_MESSAGES.sensorSerialNumberNotFound);
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
            serialNumber,
            owner: user._id,
        });
        await sensor.save();
        await sensor.generateAuthToken();

        await User.findByIdAndUpdate(user._id, { $push: { sensors: sensor } });
        sensor.owner = secureUserParams(user);
        return res.status(200).json(
            buildSuccessResponseBody({
                sensor: secureSensorParams(sensor),
            })
        );
    } catch (e) {
        console.log(e);
        return res.boom.internal(e.message);
    }
});

export const approveBySensor = asyncHandler(async (req, res) => {
    const { userId, serialNumber } = req.body;

    if (!userId) return res.boom.badData(ERROR_MESSAGES.userIdNotFound);
    if (!serialNumber)
        return res.boom.badData(ERROR_MESSAGES.sensorSerialNumberNotFound);

    try {
        const sensor = await Sensor.findOneAndUpdate(
            { owner: userId, serialNumber },
            { approvedBySensor: true },
            { new: true }
        );
        if (!sensor)
            throw Error({
                message:
                    'Sensor with current userId and serialNumber not found',
            });

        return res
            .status(200)
            .json(buildSuccessResponseBody({ token: sensor.token }));
    } catch (e) {
        console.log(e);
        return res.boom.internal(e.message);
    }
});

export const readSensorById = asyncHandler(async (req, res, next) => {
    const { sensorId } = req.params;

    if (!sensorId) return res.boom.badData(ERROR_MESSAGES.sensorIdNotFound);
    try {
        const sensor = await Sensor.findOne({
            _id: sensorId,
        }).populate(
            'values lastValue.pm10 lastValue.pm25',
            'value type createdAt -_id'
        );
        if (!sensor) throw new Error('Sensor was not found in database');

        return res
            .status(200)
            .json(
                buildSuccessResponseBody({ sensor: secureSensorParams(sensor) })
            );
    } catch (e) {
        console.log(e);
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
            sensors: req.user.sensors.filter((v) => v._id !== sensorId),
        });

        return res.status(200).json(buildSuccessResponseBody());
    } catch (e) {
        console.log(e);
        return res.boom.internal(e.message);
    }
});

// TODO: Remake with geo
export const readAllSensors = asyncHandler(async (req, res) => {
    try {
        const sensorsCollection = await Sensor.find({}).populate(
            'values lastValue.pm10 lastValue.pm25',
            'value type createdAt -_id'
        );
        let sensors = [];

        sensorsCollection.forEach((v) => {
            sensors = [...sensors, secureSensorParams(v)];
        });

        return res.status(200).json(buildSuccessResponseBody({ sensors }));
    } catch (e) {
        console.log(e);
        return res.boom.internal(e.message);
    }
});

export const DEVapproveBySensor = asyncHandler(async (req, res) => {
    const userId = req.query.userId;
    const serialNumber = req.query.serialNumber;

    if (!userId) return res.boom.badData(ERROR_MESSAGES.userIdNotFound);
    if (!serialNumber)
        return res.boom.badData(ERROR_MESSAGES.sensorSerialNumberNotFound);

    try {
        console.log(req.query);
        const sensor = await Sensor.findOneAndUpdate(
            { owner: userId, serialNumber },
            { approvedBySensor: true },
            { new: true }
        );
        console.log(sensor);
        if (!sensor) return res.boom.internal('wrong sensor');

        return res
            .status(200)
            .json(buildSuccessResponseBody({ token: sensor.token }));
    } catch (e) {
        console.log(e);
        return res.boom.internal(e.message);
    }
});
