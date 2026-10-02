const { errorResponse } = require('../util/apiResponse');

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    next();
  };
};

const requireAdmin = requireRole(['Admin']);
const requireCustomer = requireRole(['Customer']);

module.exports = {
  requireRole,
  requireAdmin,
  requireCustomer
};