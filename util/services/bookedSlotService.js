const { Op } = require('sequelize');
const { BookedSlots } = require('../../models');

function timeToMinutes(time) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function calculateEndTime(startTime, duration) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + Number(duration);

  return minutesToTime(endMinutes);
}

async function findOverlappingBookedSlot({
  staffId,
  appointment_date,
  start_time,
  end_time,
  excludeAppointmentId,
  transaction
}) {
  const whereCondition = {
    staffId,
    appointment_date,
    start_time: {
      [Op.lt]: end_time
    },
    end_time: {
      [Op.gt]: start_time
    }
  };

  if (excludeAppointmentId) {
    whereCondition.appointmentId = {
      [Op.ne]: excludeAppointmentId
    };
  }

  return BookedSlots.findOne({
    where: whereCondition,
    transaction
  });
}

async function createBookedSlot({
  staffId,
  appointmentId,
  appointment_date,
  start_time,
  end_time,
  transaction
}) {
  return BookedSlots.create({
    staffId,
    appointmentId,
    appointment_date,
    start_time,
    end_time
  }, {
    transaction
  });
}

async function deleteBookedSlotByAppointmentId(appointmentId, transaction) {
  return BookedSlots.destroy({
    where: {
      appointmentId
    },
    transaction
  });
}

module.exports = {
  calculateEndTime,
  findOverlappingBookedSlot,
  createBookedSlot,
  deleteBookedSlotByAppointmentId
};