window.addEventListener('DOMContentLoaded', () => {
  loadStaffAppointments();
  loadStaffReviews();
});

async function loadStaffReviews() {
  const container = document.getElementById('reviews-container');

  try {
    const response = await axios.get('/staff/reviews');

    const reviews = response.data.reviews;

    if (reviews.length === 0) {
      container.innerHTML = '<p class="empty-message">No reviews yet.</p>';
      return;
    }

    container.innerHTML = '';

    reviews.forEach((review) => {
      const div = document.createElement('div');
      div.className = 'review-card';

      const appointment = review.appointment;

      div.innerHTML = `
        <h4>${appointment.service.name}</h4>
        <p><strong>Customer:</strong> ${appointment.customer.name}</p>
        <p><strong>Rating:</strong> ${review.rating}/5</p>
        <p><strong>Review:</strong> ${review.comment}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.appointment_time}</p>

        ${
          review.staffResponse
            ? `<p><strong>Your Response:</strong> ${review.staffResponse}</p>`
            : `
              <textarea class="response-box" id="response-${review.id}" placeholder="Write your response"></textarea>
              <button class="respond-btn" onclick="submitResponse(${review.id})">Submit Response</button>
            `
        }
      `;

      container.appendChild(div);
    });

  } catch (error) {
    console.log('ERROR LOADING STAFF REVIEWS --->', error);
    container.innerHTML = '<p class="empty-message">Could not load reviews.</p>';
  }
}

async function submitResponse(reviewId) {
  const responseText = document.getElementById(`response-${reviewId}`).value;

  if (!responseText.trim()) {
    alert('Please write a response');
    return;
  }

  try {
    await axios.patch(`/staff/reviews/${reviewId}/response`, {
      staffResponse: responseText
    });

    alert('Response submitted successfully');
    loadStaffReviews();

  } catch (error) {
    console.log('ERROR SUBMITTING RESPONSE --->', error);
    alert(error.response?.data?.message || 'Could not submit response');
  }
}

async function loadStaffAppointments() {
  try {
    const response = await axios.get('/staff/appointments');

    renderAppointments(response.data.todayAppointments, 'today-appointments');
    renderAppointments(response.data.upcomingAppointments, 'upcoming-appointments');
    renderAppointments(response.data.completedAppointments, 'completed-appointments');

  } catch (error) {
    console.log('ERROR LOADING STAFF APPOINTMENTS --->', error);
  }
}

function renderAppointments(appointments, containerId) {
  const container = document.getElementById(containerId);

  if (appointments.length === 0) {
    container.innerHTML = '<p class="empty-message">No appointments.</p>';
    return;
  }

  container.innerHTML = '';

  appointments.forEach((appointment) => {
    const div = document.createElement('div');
    div.className = 'appointment-card';

    div.innerHTML = `
      <h4>${appointment.service.name}</h4>
      <p><strong>Customer:</strong> ${appointment.customer.name}</p>
      <p><strong>Date:</strong> ${appointment.appointment_date}</p>
      <p><strong>Time:</strong> ${appointment.appointment_time}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>
    `;

    container.appendChild(div);
  });
}

document.getElementById('staff-logout-btn').addEventListener('click', async () => {
  try {
    await axios.post('/staff/logout');
    localStorage.removeItem('staffToken');
    window.location.href = '/staff/login';
  } catch (error) {
    alert('Could not logout');
  }
});