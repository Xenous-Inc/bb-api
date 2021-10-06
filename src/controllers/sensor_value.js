import { asyncHandler } from '../middlewares/asyncHandler';
import { ERROR_MESSAGES, VALUE_TYPES } from '../utils/constants';
import Sensor from '../models/Sensor';
import SensorValue from '../models/SensorValue';
import { secureSensorDataParams } from '../utils/security';
import { buildSuccessResponseBody } from '../utils/objects';

export const postValue = asyncHandler(async (req, res) => {
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

export const DEVpostValue = asyncHandler(async (req, res) => {
    console.log('55');
    const type = req.query.type;
    const value = req.query.value;
    const serialNumber = req.query.serialNumber;

    if (!value) return res.boom.badData(ERROR_MESSAGES.sensorValueNotFound);
    if (!type) return res.boom.badData(ERROR_MESSAGES.sensorValueTypeNotFound);
    if (type !== VALUE_TYPES.PM25 && type !== VALUE_TYPES.PM10)
        return res.boom.badData(ERROR_MESSAGES.sensorValueTypeIncorrect);

    try {
        const sensor = await Sensor.findOne({ serialNumber });

        if (!sensor)
            throw new Error({ message: 'No sensor with this serialNumber' });
        const newValue = await new SensorValue({
            type,
            value,
            sensor: sensor._id,
        }).save();

        sensor.values.push(newValue);
        if (newValue.type === VALUE_TYPES.PM10)
            sensor.lastValue.pm10 = newValue._id;

        if (newValue.type === VALUE_TYPES.PM25)
            sensor.lastValue.pm25 = newValue._id;
        await sensor.save();

        return res.status(200).json(
            buildSuccessResponseBody({
                value: secureSensorDataParams(newValue),
            })
        );
    } catch (e) {
        console.log(e);
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
