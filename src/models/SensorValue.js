import { Schema, model } from 'mongoose';
import { REFS, VALUE_TYPES } from '../utils/constants';

const sensorValueSchema = new Schema({
    type: {
        type: String,
        enum: [VALUE_TYPES.PM25, VALUE_TYPES.PM10],
    },
    value: { type: Number, required: true, },
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

sensorValueSchema.set('timestamps', {
    createdAt: true,

    updatedAt: true,
});

const SensorValue = model(REFS.sensorValue, sensorValueSchema);

export default SensorValue;
