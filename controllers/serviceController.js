const path = require('path');
const { Salons, Services } = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');

const getEditServicePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'editService.html'));
};

const getServiceData = asyncHandler(async (req, res) => {
  
    
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

});

const updateService = asyncHandler(async (req, res) => {
      
  const t = await sequelize.transaction();
  
  try {

    const { name, description, price, duration, available_from, available_to } = req.body;

    const salon = await Salons.findOne({
      where: { adminId: req.user.id }
    });

    if (!salon) {
      await t.rollback();
      return res.status(404).json({ message: 'salon not found' });
    }

    const service = await Services.findOne({
      where: {
        id: req.params.id,
        salonId: salon.id
      }
    });

    if (!service) {
      await t.rollback();
      return res.status(404).json({ message: 'service not found' });
    }

    const salonOpen = salon.open_time.slice(0, 5);
    const salonClose = salon.close_time.slice(0, 5);

    if (available_from >= available_to) {
      await t.rollback();
      return res.status(400).json({
        message: 'Available from must be before available to'
      });
    }

    if (available_from < salonOpen || available_to > salonClose) {
      await t.rollback();
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
    throw error;
  }
});

module.exports = {
    getEditServicePage,
    getServiceData,
    updateService
}
