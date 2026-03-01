"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.createError = createError;
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'GUT-5000';
    res.status(statusCode).json({
        error: {
            code,
            message: err.message || 'An unexpected error occurred',
            detail: err.detail || null,
            resolution: err.resolution || 'Please try again or contact support if the problem persists.',
            docs_url: `https://docs.guttenberg.io/errors/${code}`,
        },
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            code: 'GUT-4040',
            message: `Route not found: ${req.method} ${req.path}`,
            detail: 'The requested endpoint does not exist.',
            resolution: 'Check the API documentation for valid endpoints.',
            docs_url: 'https://docs.guttenberg.io/errors/GUT-4040',
        },
    });
}
function createError(statusCode, code, message, detail, resolution) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.code = code;
    err.detail = detail;
    err.resolution = resolution;
    return err;
}
