import { asyncHandler } from '../middlewares/asyncHandler';
import User from '../models/User';
import Sensor from '../models/Sensor';
import { ERROR_MESSAGES, VALUE_TYPES } from '../utils/constants';
import { secureSensorParams, secureUserParams } from '../utils/security';
import SensorData from '../models/SensorData';

export const postNewSensor = asyncHandler(async (req, res, next) => {
    const { name, model, version, firmwareVersion, location, settings } =
        req.body;
    const user = req.user;

    if (!name) return res.boom.badData(ERROR_MESSAGES.sensorNameNotFound);
    if (!model) return res.boom.badData(ERROR_MESSAGES.sensorModelNotFound);
    if (!version) return res.boom.badData(ERROR_MESSAGES.sensorVersionNotFound);
    if (!firmwareVersion)
        return res.boom.badData(ERROR_MESSAGES.sensorFirmwareVersionNotFound);
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
        return res.status(200).json({
            sensor: secureSensorParams(sensor),
            sensorToken: sensor.token,
        });
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

        return res.status(200).json(secureSensorParams(sensor));
    } catch (e) {
        return res.boom.internal('Sensor was not found in database');
    }
});

export const postValue = asyncHandler(async (req, res, next) => {
    const sensor = req.sensor;
    const { type, value } = req.body;

    if (!value) return res.boom.badData(ERROR_MESSAGES.sensorValueNotFound);
    if (!type) return res.boom.badData(ERROR_MESSAGES.sensorValueTypeNotFound);
    if (type !== VALUE_TYPES.PM25 && type !== VALUE_TYPES.PM10)
        return res.boom.badData(ERROR_MESSAGES.sensorValueTypeIncorrect);

    try {
        await Sensor.findByIdAndUpdate(sensor._id, {
            $push: { data: { type, value } },
        });

        return res.status(200).json({});
    } catch (e) {
        return res.boom.internal('Unable to push new value to sensor');
    }
});

export const readValueById = asyncHandler(async (req, res) => {
    const { valueId } = req.param;

    if (!valueId)
        return res.boom.badRequest(ERROR_MESSAGES.sensorDataIdNotFound);

    try {
        const sensorData = await SensorData.findOne({ _id: valueId });
        if (!sensorData) throw new Error('Sensor data not found');

        return res.status(200).json({ value: sensorData });
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

// export const deleteValueById = asyncHandler(async (req, res) => {
//     const { valueId } = req.params;
//
//     if (!valueId)
//         return res.boom.badRequest(ERROR_MESSAGES.sensorDataIdNotFound);
//
//     try {
//         await SensorData.findByIdAndUpdate(valueId, )
//     }
// });
