export const secureUserParams = (user) => {
    const { password, tokens, type, email, ...userFields } = user.toObject();
    return userFields;
};

export const secureSensorParams = (sensor) => {
    const { token, data, ...sensorFields } = sensor.toObject();
    return sensorFields;
};

export const secureSensorDataParams = (params) => {
    const { isDeleted, ...sensorDataFields } = params.toObject();
    return sensorDataFields;
};
