import express from 'express';
import {
    postNewSensor,
    postValue,
    readSensorById,
} from '../controllers/sensors';
import { authSensor, authUser } from '../middlewares/auth';

// eslint-disable-next-line new-cap
const sensorRouter = express.Router();

sensorRouter.post('/', authUser, postNewSensor);
sensorRouter.get('/:sensorId', readSensorById);
sensorRouter.post('/value', authSensor, postValue);

export default sensorRouter;
