import fetch from 'node-fetch';

export const sendPhoneVerify = async (phone) => {
    return (
        await fetch(
            `https://api.ucaller.ru/v1.0/initCall?service_id=${
                process.env.SERVICE_ID
            }&key=${process.env.SERVICE_KEY}&phone=${phone.slice(1)}`
        )
    ).json();
};
