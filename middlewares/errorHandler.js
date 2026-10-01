const errorHandler = (error, req, res, next) => {
    console.error('ERROR --->', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';

    res.status(statusCode).json({
        message
    });
};

module.exports = errorHandler;
