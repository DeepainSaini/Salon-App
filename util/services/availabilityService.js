const {Op} = require('sequelize');
const {Services,Staff,BookedSlots} = require('../../models');
const {timeToMinutes, minutesToTime} = require('../timeHelpers');
const { calculateEndTime } = require('./bookedSlotService');

const getAvailableSlotsForService = async ({ salonId, serviceId, date, excludeAppointmentId }) => {
    const service = await Services.findOne({
        where: {
            id: serviceId,
            salonId,
            is_active: true
        }
    });

    if (!service) {
        return {
            error: {
                status: 404,
                message: 'service not found'
            }
        };
    }

    const staffList = await Staff.findAll({
        where: {
            salonId,
            is_active: true
        },
        include: [
            {
                model: Services,
                as: 'services',
                where: {
                    id: serviceId
                }
            }
        ]
    });

    if (staffList.length === 0) {
        return {
            slots: []
        };
    }

    const staffIds = staffList.map((staff) => staff.id);

    const bookedWhere = {
        staffId: {
            [Op.in]: staffIds
        },
        appointment_date: date
    };
    
    if (excludeAppointmentId) {
        bookedWhere.appointmentId = {
            [Op.ne]: excludeAppointmentId
        };
    }

    const bookedSlots = await BookedSlots.findAll({
      where: bookedWhere
    });

    const slots = [];

    const today = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().toTimeString().slice(0, 5);

    staffList.forEach((staff) => {
        const staffStart = timeToMinutes(staff.available_from);
        const staffEnd = timeToMinutes(staff.available_to);
        const serviceStart = timeToMinutes(service.available_from || staff.available_from);
        const serviceEnd = timeToMinutes(service.available_to || staff.available_to);

        const startMinutes = Math.max(staffStart, serviceStart);
        const endMinutes = Math.min(staffEnd, serviceEnd);
        const duration = Number(service.duration);

        for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
            const slotTime = minutesToTime(time);
            const slotEndTime = calculateEndTime(slotTime, duration);

            if (date === today && slotTime <= currentTime) {
                continue;
            }

            const hasOverlap = bookedSlots.some((bookedSlot) => {
                return (
                    bookedSlot.staffId === staff.id &&
                    slotTime < bookedSlot.end_time.slice(0, 5) &&
                    slotEndTime > bookedSlot.start_time.slice(0, 5)
                );
            });

            if (!hasOverlap) {
                slots.push({
                    time: slotTime,
                    staffId: staff.id,
                    staffName: staff.name
                });
            }
        }
    });

    return {
        slots
    };
};

module.exports = {
    getAvailableSlotsForService
};
