import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES, REFS } from '../utils/constants';
import { secureSensorParams } from '../utils/security';

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email' });
            }
        },
    },
    password: {
        type: String,
        required: false,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
    sensors: [
        {
            type: Schema.Types.ObjectId,
            ref: REFS.sensor,
        },
    ],
});

userSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (user.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.generateAuthToken = async function () {
    try {
        const user = this;
        const token = jwt.sign({ _id: user.id }, process.env.JWT_KEY);
        user.tokens = user.tokens.concat({ token });
        await user.save();
        return token;
    } catch (error) {
        throw new Error(error);
    }
};

userSchema.statics.findOneByIdAndPopulateSensors = async (userId) => {
    try {
        if (!userId) throw new Error('userId=null');

        const user = await User.findOne({ _id: userId }).populate('sensors');
        user.sensors.forEach(
            (v, i) => (user.sensors[i] = secureSensorParams(v))
        );

        return user;
    } catch (e) {
        throw new Error(e);
    }
};

userSchema.statics.findByCredentials = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error(ERROR_MESSAGES.invalidUserCredentials);
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error(ERROR_MESSAGES.invalidUserCredentials);
        }
        return user;
    } catch (error) {
        throw new Error(error);
    }
};

userSchema.set('timestamps', {
    createdAt: true,

    updatedAt: true,
});

const User = mongoose.model(REFS.user, userSchema);

export default User;
