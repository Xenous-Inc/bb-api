import { Schema, model } from 'mongoose';
import { REFS } from '../utils/constants';

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
    token: {
        type: String,
        required: true,
    },
    settings: {
        type: {
            requestFrequency: {
                type: String,
                enum: ['30m', '1h', '5h', '10h', '24h'],
                default: '30m',
            },
        },
    },
    location: {
        type: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        required: true,
    },
    data: [
        {
            type: {
                type: String,
                enum: ['PM2,5', 'PM10'],
            },
            value: { type: Number },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

sensorSchema.set('timestamps', {
    createdAt: true,

    updatedAt: true,
});

const Sensor = model(REFS.sensors, sensorSchema);

export default Sensor;
