import { Schema, model } from 'mongoose';
import { REFS } from '../utils/constants';

const authChallengeSchema = new Schema({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: null,
    },
    code: {
        type: String,
        required: true,
        default: '',
    },
    id: {
        type: String,
        required: true,
        default: '',
    },
    phoneId: {
        type: String,
        required: true,
        default: '',
    },
});

authChallengeSchema.set('timestamps', {
    createdAt: true,
    updatedAt: true,
});

const AuthModel = model(REFS.authChallenge, authChallengeSchema);

export default AuthModel;
