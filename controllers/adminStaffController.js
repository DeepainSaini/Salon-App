const path = require('path');
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');
const {Salons,Services,Staff,StaffServices} = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');

const getAddStaffForm =  (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','addStaff.html'));
}

const getDataForStaffForm = asyncHandler(async (req, res) => {

    
    const salon = await Salons.findOne({
        where: {
            adminId: req.user.id
        }
    });

    if (!salon) {
        return res.status(404).json({
            message: "salon not found"
        });
    }

    const services = await Services.findAll({
        where: {
            salonId: salon.id,
            is_active: true
        }
    });

    res.status(200).json({
        salon: {
            open_time: salon.open_time,
            close_time: salon.close_time
        },
        services: services
    });

});

const postAddStaff = asyncHandler(async (req, res) => {

    const t = await sequelize.transaction();
    try {
        const { name, phone, email, specialization, available_from, available_to, serviceIds, password } = req.body;

        if (!serviceIds || serviceIds.length === 0) {
            await t.rollback();
            return res.status(400).json({
                message: "Please assign at least one service"
            });
        }

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const services = await Services.findAll({
            where: {
                id: {
                [Op.in]: serviceIds
                },
                salonId: salon.id,
                is_active: true
            }
        });

        if (services.length !== serviceIds.length) {
            await t.rollback();
            return res.status(400).json({
                message: "Invalid service selected"
            });
        }

        const salonOpen = salon.open_time.slice(0, 5);
        const salonClose = salon.close_time.slice(0, 5);

        if (available_from >= available_to) {
            await t.rollback();
            return res.status(400).json({
                message: "Available from must be before available to"
            });
        }

        if (available_from < salonOpen || available_to > salonClose) {
            await t.rollback();
            return res.status(400).json({
                message: "Staff availability must be inside salon working hours"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = await Staff.create({
            name: name,
            phone: phone,
            email: email,
            password: hashedPassword,
            specialization: specialization,
            available_from: available_from,
            available_to: available_to,
            salonId: salon.id,
            serviceId: serviceIds[0]
        },{transaction: t});

        const staffServiceRows = serviceIds.map((serviceId) => {
            return {
                staffId: staff.id,
                serviceId
            };
        });

        await StaffServices.bulkCreate(staffServiceRows, { transaction: t });

        await t.commit();
        res.status(201).json({
            message: "staff added successfully"
        });

    } catch (error) {
        console.log("ERROR ADDING STAFF ---> ", error);
        await t.rollback();
        throw error;
    }
});

const changeStaffStatus = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const staffId = req.params.id;

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const staff = await Staff.findOne({
            where: {
                id: staffId,
                salonId: salon.id
            }
        });

        if (!staff) {
            await t.rollback();
            return res.status(404).json({
                message: "staff not found"
            });
        }

        staff.is_active = !staff.is_active;

        await staff.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: "staff status updated",
            is_active: staff.is_active
        });

    } catch (error) {
        console.log("ERROR UPDATING STAFF STATUS ---> ", error);
        await t.rollback();
        throw error;
    }
});

module.exports = {
    getAddStaffForm,
    getDataForStaffForm,
    postAddStaff,
    changeStaffStatus
};
