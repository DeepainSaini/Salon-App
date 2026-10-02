const { errorResponse } = require('../util/apiResponse');
const { config } = require('../config/appConfig');

const errorHandler = (error, req, res, next) => {
    console.error('ERROR --->', error);

    const statusCode = error.statusCode || 500;
    const message =
    config.env === 'production' && statusCode === 500
      ? 'Something went wrong'
      : error.message || 'Something went wrong';

    errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
