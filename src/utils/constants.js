export const REFS = {
    user: 'User',
    sensor: 'Sensor',
    sensorValue: 'SensorValue',
};

export const ERROR_MESSAGES = {
    notFound: 'There is nothing here!',
    // User
    invalidUserCredentials: 'Invalid email or password',
    userIdNotFound: 'User ID not found in request body',
    userNameNotFound: 'Name not found in request body',
    userEmailNotFound: 'Email not found in request body',
    userPasswordNotFound: 'Password not found in request body',
    userCredentialsNotFound: 'Email or password not found in request body',
    // Sensor
    sensorNameNotFound: 'Sensor name not found in request body',
    sensorModelNotFound: 'Sensor model not found in request body',
    sensorVersionNotFound: 'Sensor version not found in request body',
    sensorFirmwareVersionNotFound:
        'Sensor firmware version not found in request body',
    sensorLocationNotFound: 'Sensor location not found in request body',
    sensorIdNotFound: 'Sensor id not found in request params',
    sensorSerialNumberNotFound:
        'Sensor serial number not found in request params',
    // Sensor value
    sensorValueNotFound: 'Sensor Value type not found in request body',
    sensorValueTypeNotFound: 'Sensor Value type not found in request body',
    sensorValueTypeIncorrect: 'Sensor Value type incorrect',
    sensorDataIdNotFound: 'Sensor Data Id not found in request params',
};

export const VALUE_TYPES = {
    PM25: 'PM2.5',
    PM10: 'PM10',
};
