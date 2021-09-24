export const buildSuccessResponseBody = (body) => {
    if (!body) return {};
    return { data: body };
};
