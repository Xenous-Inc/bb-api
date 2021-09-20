import { Schema, model } from 'mongoose';
import { REFS, VALUE_TYPES } from '../utils/constants';

const sensorDataSchema = new Schema({
    type: {
        type: String,
        enum: [VALUE_TYPES.PM25, VALUE_TYPES.PM10],
    },
    value: { type: Number },
    sensor: {
        type: Schema.Types.ObjectId,
        ref: REFS.sensor,
        required: true,
    },
    isDeleted: {
        type: Schema.Types.Boolean,
        default: false,
    },
});

sensorDataSchema.set('timestamps', {
    createdAt: true,

    updatedAt: true,
});

const SensorData = model(REFS.sensorData, sensorDataSchema);

export default SensorData;
