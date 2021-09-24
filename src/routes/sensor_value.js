import express from 'express';
import { authSensor, authUser } from '../middlewares/auth';
import {
    deleteSensorValueById,
    postValue,
    readSensorAllValues,
    readValueById,
} from '../controllers/sensor_value';

// eslint-disable-next-line new-cap
const sensorValueRouter = express.Router();

sensorValueRouter.post('/', authSensor, postValue);
sensorValueRouter.get('/:valueId', readValueById);
sensorValueRouter.delete('/:valueId', authUser, deleteSensorValueById);
sensorValueRouter.get('/all/:sensorId', readSensorAllValues);

export default sensorValueRouter;
