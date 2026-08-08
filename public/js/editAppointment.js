const pathParts = window.location.pathname.split('/');
const appointmentId = pathParts[pathParts.indexOf('appointments') + 1];

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get(`/admin/appointments/${appointmentId}/data`);

    const appointment = response.data.appointment;

    document.getElementById('appointment-details').innerHTML = `
      <p><strong>Customer:</strong> ${appointment.customer.name}</p>
      <p><strong>Service:</strong> ${appointment.service.name}</p>
      <p><strong>Current Staff:</strong> ${appointment.staff.name}</p>
      <p><strong>Current Date:</strong> ${appointment.appointment_date}</p>
      <p><strong>Current Time:</strong> ${appointment.appointment_time}</p>
    `;

    document.getElementById('appointment-date').value = appointment.appointment_date;

  } catch (error) {
    console.log('ERROR LOADING APPOINTMENT --->', error);
    alert(error.response?.data?.message || 'Could not load appointment');
  }
});

document.getElementById('check-slots-btn').addEventListener('click', async () => {
  const date = document.getElementById('appointment-date').value;

  if (!date) {
    alert('Please select a date');
    return;
  }

  try {
    const response = await axios.get(`/admin/appointments/${appointmentId}/available-slots?date=${date}`);

    showSlots(response.data.slots, date);

  } catch (error) {
    console.log('ERROR GETTING SLOTS --->', error);
    alert(error.response?.data?.message || 'Could not load slots');
  }
});

function showSlots(slots, date) {
  const slotsList = document.getElementById('slots-list');

  if (slots.length === 0) {
    slotsList.innerHTML = '<p class="empty-message">No slots available.</p>';
    return;
  }

  slotsList.innerHTML = '';

  slots.forEach((slot) => {
    const button = document.createElement('button');
    button.className = 'slot-btn';
    button.textContent = `${slot.time} - ${slot.staffName}`;

    button.addEventListener('click', () => {
      updateAppointment(slot, date);
    });

    slotsList.appendChild(button);
  });
}

async function updateAppointment(slot, date) {
  try {
    await axios.patch(`/admin/appointments/${appointmentId}/reschedule`, {
      staffId: slot.staffId,
      appointment_date: date,
      appointment_time: slot.time
    });

    alert('Appointment updated successfully');
    window.location.href = '/admin/dashboard';

  } catch (error) {
    console.log('ERROR UPDATING APPOINTMENT --->', error);
    alert(error.response?.data?.message || 'Could not update appointment');
  }
}