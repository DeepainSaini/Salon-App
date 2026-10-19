const path = require('path');
const {Salons,Services} = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');
const { deleteCacheByPattern } = require('../util/services/cacheServices');


const getAddServiceForm =  (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','addServices.html'));
}

const postAddedService = asyncHandler(async (req,res) => {

    const t = await sequelize.transaction();

    try{

        const {name,description,price,duration,available_from, available_to} = req.body;

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({
                message: "Please create salon details first"
            });
        }

        const salonOpen = salon.open_time.slice(0, 5);
        const salonClose = salon.close_time.slice(0, 5);

        if (available_from &&available_to &&(available_from < salonOpen || available_to > salonClose)) 
        {
            await t.rollback();
            return res.status(400).json({
                message: "Service availability must be inside salon working hours"
            });
        }

        const newService = await Services.create({
            name: name,
            description: description,
            price: price,
            duration: duration,
            available_from: available_from,
            available_to: available_to,
            salonId: salon.id 
        }, { transaction: t });

        await t.commit();
        await deleteCacheByPattern(`salon:${salon.id}:services:*`);

        res.status(201).json({
            message: "Service added successfully"
        });

    }catch(error){

        await t.rollback();
        throw error;
    }
});

const changeServiceStatus = asyncHandler(async (req,res) => {

    const t = await sequelize.transaction();
    
    try{

        const serviceId = req.params.id;
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

        const service = await Services.findOne({
            where: {
                id: serviceId,
                salonId: salon.id   // always add salonId so that other admin can't change other service 
            }
        });

        if (!service) {
            await t.rollback();
            return res.status(404).json({
                message: "service not found"
            });
        }

        service.is_active = !service.is_active;

        await service.save({transaction : t});
        await t.commit();
        await deleteCacheByPattern(`salon:${salon.id}:services:*`);

        res.status(200).json({
            message: "service status updated",
            is_active: service.is_active
        });

    } catch (error) {
        await t.rollback();
        throw error;
    }
    
});

module.exports = {
    postAddedService,
    getAddServiceForm,
    changeServiceStatus,
}
