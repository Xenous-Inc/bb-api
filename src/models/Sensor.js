import { Schema, model } from 'mongoose';
import { REFS } from '../utils/constants';
import jwt from 'jsonwebtoken';

const sensorSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    firmwareVersion: {
        type: String,
        required: true,
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
    },
    approvedBySensor: {
        type: Schema.Types.Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: REFS.user,
        required: true,
    },
    token: {
        type: String,
    },
    settings: {
        requestFrequency: {
            type: String,
            enum: ['30m', '1h', '5h', '10h', '24h'],
            default: '30m',
        },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
        },
    },
    lastValue: {
        pm25: {
            type: Schema.Types.ObjectId,
            ref: REFS.sensorValue,
        },
        pm10: {
            type: Schema.Types.ObjectId,
            ref: REFS.sensorValue,
        },
    },
    values: [
        {
            type: Schema.Types.ObjectId,
            ref: REFS.sensorValue,
        },
    ],
});

sensorSchema.set('timestamps', {
    createdAt: true,

    updatedAt: true,
});

sensorSchema.methods.generateAuthToken = async function () {
    try {
        const sensor = this;
        const token = jwt.sign({ _id: sensor.id }, process.env.JWT_KEY);
        sensor.token = token;
        await sensor.save();
        return token;
    } catch (error) {
        throw new Error(error);
    }
};

const Sensor = model(REFS.sensor, sensorSchema);

export default Sensor;
