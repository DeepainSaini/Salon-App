const pathParts = window.location.pathname.split('/');
const customerId = pathParts[pathParts.indexOf('customers') + 1];

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get(`/admin/customers/${customerId}/data`);

    showCustomerInfo(response.data.customer);
    showCustomerAppointments(response.data.appointments);

  } catch (error) {
    console.log('ERROR LOADING CUSTOMER DETAILS --->', error);
    alert(error.response?.data?.message || 'Could not load customer details');
  }
});

function showCustomerInfo(customer) {
  document.getElementById('customer-info').innerHTML = `
    <div class="item-card">
      <h3>${customer.name}</h3>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
      <p><strong>Notification Preference:</strong> ${customer.notification_preference}</p>
    </div>
  `;
}

function showCustomerAppointments(appointments) {
  const container = document.getElementById('customer-appointments');

  if (appointments.length === 0) {
    container.innerHTML = '<p class="empty-message">No appointments.</p>';
    return;
  }

  container.innerHTML = '';

  appointments.forEach((appointment) => {
    const div = document.createElement('div');
    div.className = 'appointment-card';

    div.innerHTML = `
      <h3>${appointment.service.name}</h3>
      <p><strong>Staff:</strong> ${appointment.staff.name}</p>
      <p><strong>Date:</strong> ${appointment.appointment_date}</p>
      <p><strong>Time:</strong> ${appointment.appointment_time}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>
      <p><strong>Payment:</strong> ${appointment.paymentStatus}</p>
      <p><strong>Price:</strong> ₹${appointment.bookingPrice}</p>

      ${
        appointment.invoice
          ? `<p><a href="${appointment.invoice.pdfPath}" target="_blank">Download Invoice</a></p>`
          : ''
      }

      ${
        appointment.review
          ? `
            <div class="review-box">
              <p><strong>Rating:</strong> ${appointment.review.rating}/5</p>
              <p><strong>Review:</strong> ${appointment.review.comment}</p>
              <p><strong>Staff Response:</strong> ${appointment.review.staffResponse || 'No response yet'}</p>
            </div>
          `
          : ''
      }
    `;

    container.appendChild(div);
  });
}