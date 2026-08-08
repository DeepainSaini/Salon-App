const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Staff, Reviews, Appointments, Services, Users } = require('../models');

const getStaffLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'staffLogin.html'));
};

const staffLogin = async (req, res) => {
  
    
    try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({
      where: { email }
    });

    if (!staff) {
      return res.status(404).json({
        message: 'staff not found'
      });
    }

    if (!staff.is_active) {
        return res.status(403).json({
            message: "staff account is inactive"
        });
    }

    const isMatch = await bcrypt.compare(password, staff.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'incorrect password'
      });
    }

    const token = jwt.sign(
      {
        staffId: staff.id,
        role: 'staff'
      },
      process.env.JWT_SECRET_KEY
    );

    res.cookie('staffToken', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.status(200).json({
        message: 'staff logged in',
        token,
        staffName: staff.name,
        mustChangePassword: staff.mustChangePassword
    });

  } catch (error) {
    console.log('STAFF LOGIN ERROR --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

const getStaffDashboardPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'staffDashboard.html'));
};

const getStaffAppointments = async (req, res) => {
  try {

    if (req.staff.mustChangePassword) {
        return res.status(403).json({
            message: 'Please change your password first'
        });
    }
    const today = new Date().toISOString().slice(0, 10);

    const appointments = await Appointments.findAll({
      where: {
        staffId: req.staff.id,
        paymentStatus: 'paid'
      },
      include: [
        { model: Services, as: 'service' },
        { model: Users, as: 'customer' }
      ],
      order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
    });

    const todayAppointments = [];
    const upcomingAppointments = [];
    const completedAppointments = [];

    appointments.forEach((appointment) => {
      if (appointment.status === 'completed') {
        completedAppointments.push(appointment);
      } else if (appointment.status === 'booked' && appointment.appointment_date === today) {
        todayAppointments.push(appointment);
      } else if (appointment.status === 'booked' && appointment.appointment_date > today) {
        upcomingAppointments.push(appointment);
      }
    });

    res.status(200).json({
      todayAppointments,
      upcomingAppointments,
      completedAppointments
    });

  } catch (error) {
    console.log('ERROR GETTING STAFF APPOINTMENTS --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

const getStaffReviews = async (req, res) => {
  try {

    if (req.staff.mustChangePassword) {
        return res.status(403).json({
            message: 'Please change your password first'
        });
    }
    const reviews = await Reviews.findAll({
      include: [
        {
          model: Appointments,
          as: 'appointment',
          where: {
            staffId: req.staff.id,
            status: 'completed',
            paymentStatus: 'paid'
          },
          include: [
            { model: Services, as: 'service' },
            { model: Users, as: 'customer' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      reviews
    });

  } catch (error) {
    console.log('ERROR GETTING STAFF REVIEWS --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffResponse } = req.body;

    if (!staffResponse || !staffResponse.trim()) {
      return res.status(400).json({
        message: 'Response is required'
      });
    }

    const review = await Reviews.findOne({
      where: { id },
      include: [
        {
          model: Appointments,
          as: 'appointment',
          where: {
            staffId: req.staff.id
          }
        }
      ]
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    review.staffResponse = staffResponse.trim();
    review.respondedAt = new Date();

    await review.save();

    res.status(200).json({
      message: 'Response added successfully',
      review
    });

  } catch (error) {
    console.log('ERROR STAFF RESPONDING TO REVIEW --->', error);
    res.status(500).json({
      message: 'Could not respond to review'
    });
  }
};

const getStaffChangePasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'staffChangePassword.html'));
};

const changeStaffPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'old password and new password are required'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, req.staff.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'old password is incorrect'
      });
    }

    req.staff.password = await bcrypt.hash(newPassword, 10);
    req.staff.mustChangePassword = false;

    await req.staff.save();

    res.status(200).json({
      message: 'password changed successfully'
    });

  } catch (error) {
    console.log('STAFF CHANGE PASSWORD ERROR --->', error);
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

const staffLogout = (req, res) => {
  res.clearCookie('staffToken');

  res.status(200).json({
    message: 'staff logged out'
  });
};



module.exports = {
  getStaffLoginPage,
  staffLogin,
  getStaffDashboardPage,
  getStaffReviews,
  respondToReview,
  staffLogout,
  getStaffAppointments,
  getStaffChangePasswordPage,
  changeStaffPassword
};