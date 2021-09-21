export const secureUserParams = (user) => {
    const { password, tokens, type, email, __v, ...userFields } = user.toObject();
    return userFields;
};

export const secureSensorParams = (sensor) => {
    const { token, data, __v, ...sensorFields } = sensor.toObject();
    return sensorFields;
};

export const secureSensorDataParams = (params) => {
    const { isDeleted, __v, ...sensorDataFields } = params.toObject();
    return sensorDataFields;
};
