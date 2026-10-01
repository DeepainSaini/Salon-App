const {Op} = require('sequelize');
const {Services,Staff,Appointments} = require('../../models');
const {timeToMinutes, minutesToTime} = require('../timeHelpers');

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

    const bookedWhere = {
        salonId,
        serviceId,
        appointment_date: date,
        status: {
            [Op.in]: ['booked']
        }
    };

    if (excludeAppointmentId) {
        bookedWhere.id = {
            [Op.ne]: excludeAppointmentId
        };
    }

    const bookedAppointments = await Appointments.findAll({
      where: bookedWhere
    });

    const bookedSlots = bookedAppointments.map((appointment) => {
        return `${appointment.staffId}-${appointment.appointment_time.slice(0, 5)}`;
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

            if (date === today && slotTime <= currentTime) {
                continue;
            }

            const slotKey = `${staff.id}-${slotTime}`;

            if (!bookedSlots.includes(slotKey)) {
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
