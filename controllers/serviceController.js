const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Staff,Appointments,Reviews,StaffServices} = require('../models');
const {Sequelize,DataTypes, where,Op} = require('sequelize');
const { sequelize } = require('../models');

const getEditServicePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'editService.html'));
};

const getServiceData = async (req, res) => {
  try {
    const salon = await Salons.findOne({
      where: { adminId: req.user.id }
    });

    if (!salon) {
      return res.status(404).json({ message: 'salon not found' });
    }

    const service = await Services.findOne({
      where: {
        id: req.params.id,
        salonId: salon.id
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'service not found' });
    }

    res.status(200).json({ service });

  } catch (error) {
    console.log('ERROR GETTING SERVICE DATA --->', error);
    res.status(500).json({ message: 'something went wrong' });
  }
};

const updateService = async (req, res) => {
      
     const t = await sequelize.transaction();
  
    try {
    const { name, description, price, duration, available_from, available_to } = req.body;

    const salon = await Salons.findOne({
      where: { adminId: req.user.id }
    });

    if (!salon) {
      return res.status(404).json({ message: 'salon not found' });
    }

    const service = await Services.findOne({
      where: {
        id: req.params.id,
        salonId: salon.id
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'service not found' });
    }

    const salonOpen = salon.open_time.slice(0, 5);
    const salonClose = salon.close_time.slice(0, 5);

    if (available_from >= available_to) {
      return res.status(400).json({
        message: 'Available from must be before available to'
      });
    }

    if (available_from < salonOpen || available_to > salonClose) {
      return res.status(400).json({
        message: 'Service availability must be inside salon working hours'
      });
    }

    service.name = name;
    service.description = description;
    service.price = price;
    service.duration = duration;
    service.available_from = available_from;
    service.available_to = available_to;

    await service.save({transaction:t});
    await t.commit();

    res.status(200).json({
      message: 'service updated successfully',
      service
    });

  } catch (error) {
    await t.rollback()
    console.log('ERROR UPDATING SERVICE --->', error);
    res.status(500).json({ message: 'something went wrong' });
  }
};

module.exports = {
    getEditServicePage,
    getServiceData,
    updateService
}