import fetch from 'node-fetch';

export const sendPhoneVerify = async (phone) => {
    return (
        await fetch(
            `https://api.ucaller.ru/v1.0/initCall?service_id=692777&key=NL5PauUIVrFdfx90pjXETpevg6TFjc7F&phone=${phone.slice(
                1
            )}`
        )
    ).json();
};
