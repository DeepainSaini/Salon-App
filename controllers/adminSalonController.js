const path = require('path');
const {Salons} = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');

const getAdminDetailsForm = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','salonDetails.html'));
}

const postSalonDetails = asyncHandler(async (req,res) => {

    const t = await sequelize.transaction();

    try {

        const {name,description,email,address,zipcode,city,phone,open_time,close_time} = req.body;

        const newSalon = await Salons.create({
            name: name,
            description: description,
            email: email,
            address: address,
            zip_code: zipcode,
            city: city,
            phone: phone,
            open_time: open_time,
            close_time: close_time,
            adminId: req.user.id
        }, { transaction: t });

         await t.commit();

        return res.status(201).json({
            success: true,
            message: "Onboarding complete! Your salon profile and menu are active."
        });

    } catch (error) {
        await t.rollback();
        throw error;
    }

})

const getEditSalonDetailsPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'editSalonDetails.html'));
};

const getSalonDetailsData = asyncHandler(async (req, res) => {
  
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

    res.status(200).json({
      salon
    });
});

const updateSalonDetails = asyncHandler(async (req, res) => {
  
  const t = await sequelize.transaction();
  try {
    const {
      name,
      description,
      email,
      address,
      zipcode,
      city,
      phone,
      open_time,
      close_time
    } = req.body;

    if (open_time >= close_time) {
      await t.rollback();
      return res.status(400).json({
        message: 'Opening time must be before closing time'
      });
    }

    const salon = await Salons.findOne({
      where: {
        adminId: req.user.id
      },
      transaction: t
    });

    if (!salon) {
      await t.rollback();
      return res.status(404).json({
        message: 'salon not found'
      });
    }

    salon.name = name;
    salon.description = description;
    salon.email = email;
    salon.address = address;
    salon.zip_code = zipcode;
    salon.city = city;
    salon.phone = phone;
    salon.open_time = open_time;
    salon.close_time = close_time;

    await salon.save({transaction:t});
    
    await t.commit()
    res.status(200).json({
      message: 'salon details updated successfully',
      salon
    });

  } catch (error) {
    await t.rollback()
    throw error;
  }
});

module.exports = {
    getAdminDetailsForm,
    postSalonDetails,
    getEditSalonDetailsPage,
    getSalonDetailsData,
    updateSalonDetails
};
