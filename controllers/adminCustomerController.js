const path = require('path');
const {Users,Salons,Services,Staff,Appointments,Reviews,Invoice} = require('../models');
const asyncHandler = require('../util/asyncHandler');

const getCustomerDetailsPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'adminCustomerDetails.html'));
};

const getCustomerDetailsData = asyncHandler(async (req, res) => {
    
  const customerId = req.params.id;

  const salon = await Salons.findOne({
    where: {
      adminId: req.user.id
    }
  });

  if (!salon) {
    return res.status(404).json({
      message: 'salon not found'
    });
  }

  const customer = await Users.findByPk(customerId, {
    attributes: ['id', 'name', 'email', 'phone', 'notification_preference']
  });

  if (!customer) {
    return res.status(404).json({
      message: 'customer not found'
    });
  }

  const appointments = await Appointments.findAll({
    where: {
      salonId: salon.id,
      userId: customerId,
      paymentStatus: 'paid'
    },
    include: [
      { model: Services, as: 'service' },
      { model: Staff, as: 'staff' },
      { model: Reviews, as: 'review', required: false },
      { model: Invoice, as: 'invoice', required: false }
    ],
    order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
  });

  if (appointments.length === 0) {
    return res.status(403).json({
      message: 'customer has no appointments with your salon'
    });
  }

  res.status(200).json({
    customer,
    appointments
  });

});

module.exports = {
  getCustomerDetailsPage,
  getCustomerDetailsData
};
