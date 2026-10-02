const { errorResponse } = require('../util/apiResponse');

const isEmpty = (value) => {
    return value === undefined || value === null || value === '';
};

const requireFields = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            if (isEmpty(req.body[field])) {
                return errorResponse(res, 400, `${field} is required`);
            }
        }

        next();
    };
};

const requireArrayField = (field) => {
    return (req, res, next) => {
        if (!Array.isArray(req.body[field]) || req.body[field].length === 0) {
            return errorResponse(res, 400, `${field} must contain at least one value`);
        }

        next();
    };
};

const requireRatingRange = (field = 'rating') => {
    return (req, res, next) => {
        const rating = Number(req.body[field]);

        if (Number.isNaN(rating) || rating < 1 || rating > 5) {
            return errorResponse(res, 400, 'Rating must be between 1 and 5');
        }

        next();
    };
};

const requireParams = (params) => {
    return (req, res, next) => {
        for (const param of params) {
            if (isEmpty(req.params[param])) {
                return errorResponse(res, 400, `${param} param is required`);
            }
        }

        next();
    };
};

const requireQuery = (queries) => {
    return (req, res, next) => {
        for (const query of queries) {
            if (isEmpty(req.query[query])) {
                return errorResponse(res, 400, `${query} query is required`);
            }
        }

        next();
    };
};

const requireStrongPassword = (field = 'password') => {
    return (req, res, next) => {
        const password = req.body[field];

        if (!password || password.length < 8) {
            return errorResponse(res, 400, 'Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            return errorResponse(res, 400, 'Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            return errorResponse(res, 400, 'Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            return errorResponse(res, 400, 'Password must contain at least one number');
        }

        next();
    };
};

module.exports = {
    requireFields,
    requireArrayField,
    requireRatingRange,
    requireParams,
    requireQuery,
    requireStrongPassword
};
