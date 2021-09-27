import { asyncHandler } from '../middlewares/asyncHandler';
import { ERROR_MESSAGES, VALUE_TYPES } from '../utils/constants';
import Sensor from '../models/Sensor';
import SensorValue from '../models/SensorValue';
import { secureSensorDataParams } from '../utils/security';
import { buildSuccessResponseBody } from '../utils/objects';

export const postValue = asyncHandler(async (req, res, next) => {
    const sensor = req.sensor;
    const { type, value } = req.body;

    if (!value) return res.boom.badData(ERROR_MESSAGES.sensorValueNotFound);
    if (!type) return res.boom.badData(ERROR_MESSAGES.sensorValueTypeNotFound);
    if (type !== VALUE_TYPES.PM25 && type !== VALUE_TYPES.PM10)
        return res.boom.badData(ERROR_MESSAGES.sensorValueTypeIncorrect);

    try {
        const newValue = await new SensorValue({
            type,
            value,
            sensor: sensor._id,
        }).save();

        await Sensor.findByIdAndUpdate(sensor._id, {
            $push: { values: newValue },
            lastValue: newValue,
        });

        return res
            .status(200)
            .json(buildSuccessResponseBody({ value: newValue }));
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

export const readValueById = asyncHandler(async (req, res) => {
    const { valueId } = req.params;

    if (!valueId)
        return res.boom.badRequest(ERROR_MESSAGES.sensorDataIdNotFound);

    try {
        const sensorData = await SensorValue.findOne({ _id: valueId });
        if (!sensorData || sensorData.isDeleted)
            throw new Error('Sensor data not found');

        return res
            .status(200)
            .json(buildSuccessResponseBody({ value: sensorData }));
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

export const readSensorAllValues = asyncHandler(async (req, res) => {
    const { sensorId } = req.params;

    if (!sensorId) throw new Error(ERROR_MESSAGES.sensorIdNotFound);

    try {
        const sensor = await Sensor.findById(sensorId).populate('values');
        if (!sensor) throw new Error('Sensor not found');

        const values = [];
        sensor.values.forEach((e) => {
            if (!e.isDeleted) values.push(secureSensorDataParams(e));
        });

        return res.status(200).json(buildSuccessResponseBody({ values }));
    } catch (e) {
        return res.boom.internal(e.message);
    }
});

export const deleteSensorValueById = asyncHandler(async (req, res) => {
    const { valueId } = req.params;

    if (!valueId) return res.boom.badData(ERROR_MESSAGES.sensorDataIdNotFound);

    try {
        await SensorValue.findByIdAndUpdate(valueId, { isDeleted: true });

        return res.status(200).json(buildSuccessResponseBody());
    } catch (e) {
        return res.boom.internal(e.message);
    }
});
