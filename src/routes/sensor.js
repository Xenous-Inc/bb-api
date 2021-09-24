import express from 'express';
import {
    deleteSensorById,
    postNewSensor,
    readSensorById,
} from '../controllers/sensors';
import { authUser } from '../middlewares/auth';
import sensorValueRouter from './sensor_value';

// eslint-disable-next-line new-cap
const sensorRouter = express.Router();

sensorRouter.post('/', authUser, postNewSensor);
sensorRouter.get('/:sensorId', readSensorById);
sensorRouter.delete('/:sensorId', authUser, deleteSensorById);

sensorRouter.use('/value', sensorValueRouter);
export default sensorRouter;
