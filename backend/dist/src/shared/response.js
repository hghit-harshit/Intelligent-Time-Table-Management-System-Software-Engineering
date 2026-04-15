export const ok = (res, data, statusCode = 200) => {
    return res.status(statusCode).json(data);
};
export const fail = (res, message, statusCode = 400, details) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(details ? { details } : {}),
    });
};
