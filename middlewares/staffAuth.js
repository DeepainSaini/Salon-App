const jwt = require('jsonwebtoken');
const { Staff } = require('../models');
const { config } = require('../config/appConfig');

const authenticateStaff = async (req, res, next) => {
  try {
    const token = req.cookies.staffToken || req.header('Authorization');

    if (!token) {
      return res.redirect('/staff/login');
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret);

    const staff = await Staff.findByPk(decoded.staffId);

    if (!staff) {
      return res.redirect('/staff/login');
    }

    if (!staff || !staff.is_active) {
        res.clearCookie('staffToken');

        return res.redirect('/staff/login');
    }

    req.staff = staff;

    if (staff.mustChangePassword &&req.path !== '/change-password') {
     return res.redirect('/staff/change-password');
    }


    next();

  } catch (error) {
    return res.redirect('/staff/login');
  }
};

module.exports = {
  authenticateStaff
};
