const { errorResponse } = require('../util/apiResponse');
const { config } = require('../config/appConfig');
const logger = require('../util/logger');

const errorHandler = (error, req, res, next) => {
    logger.error('REQUEST ERROR', {
        method: req.method,
        path: req.originalUrl,
        error: error.message,
        stack: error.stack
    });

    const statusCode = error.statusCode || 500;
    const message =
    config.env === 'production' && statusCode === 500
      ? 'Something went wrong'
      : error.message || 'Something went wrong';

    errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
