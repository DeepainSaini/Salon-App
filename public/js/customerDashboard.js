document.getElementsByTagName('h1')[0].innerHTML = `WELCOME ${localStorage.getItem('name')}`; 
const accountBtn = document.getElementById('account-menu-btn');
const accountDropdown = document.getElementById('account-dropdown');

accountBtn.addEventListener('click', () => {
  accountDropdown.classList.toggle('show');
});

window.addEventListener('click', (event) => {
  if (!event.target.closest('.account-menu')) {
    accountDropdown.classList.remove('show');
  }
});

window.addEventListener('DOMContentLoaded', async () => {
    loadSalons();
    loadMyAppointments();
});

document.getElementById('salon-search-btn').addEventListener('click', () => {
    const search = document.getElementById('salon-search-input').value.trim();
    loadSalons(search);
});

document.getElementById('clear-search-btn').addEventListener('click', () => {
    document.getElementById('salon-search-input').value = '';
    loadSalons();
});

let searchTimer;

document.getElementById('salon-search-input').addEventListener('input', (event) => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
        const search = event.target.value.trim();
        loadSalons(search);
    }, 300);
});

async function loadSalons(search = '') {
    try {
        const response = await axios.get(`/user/dashboard-data?search=${search}`);
        showSalons(response.data.salons);
    } catch (error) {
        console.log("ERROR LOADING SALONS ---> ", error);
    }
}

function showSalons(salons) {
    const salonsList = document.getElementById('salons-list');

    salonsList.innerHTML = "";

    if (salons.length === 0) {
        salonsList.innerHTML = `<p class="empty-message">No salons found.</p>`;
        return;
    }

    salons.forEach((salon) => {
        const salonCard = document.createElement('div');
        salonCard.className = 'salon-card';

        salonCard.innerHTML = `
            <h3>${salon.name}</h3>
            <p>${salon.description}</p>
            <p><strong>City:</strong> ${salon.city}</p>
            <p><strong>Contact Number: </strong> ${salon.phone}</p>
            <p><strong>Open:</strong> ${salon.open_time} - ${salon.close_time}</p>

            <button onclick="viewSalonServices(${salon.id})">
                View Services
            </button>
        `;

        salonsList.appendChild(salonCard);
    });
}

async function loadMyAppointments() {
    try {
        const response = await axios.get('/user/my-appointments');
        showMyAppointments(response.data.appointments);
    } catch (error) {
        console.log("ERROR LOADING APPOINTMENTS ---> ", error);
    }
}

function showMyAppointments(appointments) {
    const appointmentsList = document.getElementById('appointments-list');

    if (appointments.length === 0) {
        appointmentsList.innerHTML = `<p class="empty-message">No appointments yet.</p>`;
        return;
    }

    appointmentsList.innerHTML = "";

    const upcoming = appointments.filter((appointment) => {
        return(appointment.status === 'booked');
    })

    const completed = appointments.filter((appointment) => {
        return(appointment.status === 'completed');
    })

    const cancelled = appointments.filter((appointment) => {

        return(appointment.status === 'cancelled');
    })

    appointmentsList.innerHTML = `
        <section>
        <h3>Upcoming Appointments</h3>
        <div id="upcoming-list"></div>
        </section>

        <section>
        <h3>Completed Appointments</h3>
        <div id="completed-list"></div>
        </section>

        <section>
        <h3>Cancelled Appointments</h3>
        <div id="cancelled-list"></div>
        </section>
    `;

    renderAppointmentCards(upcoming, document.getElementById('upcoming-list'));
    renderAppointmentCards(completed, document.getElementById('completed-list'));
    renderAppointmentCards(cancelled, document.getElementById('cancelled-list'));
}

function renderAppointmentCards(appointments, container) {
    
    if (appointments.length === 0) {
        container.innerHTML =
        `<p class="empty-message">No appointments.</p>`;
        return;
    }

    appointments.forEach((appointment) => {
        const div = document.createElement('div');
        div.className = 'appointment-card';

        let actions = '';

        if (appointment.status === 'booked' && appointment.paymentStatus === 'paid') {
        
            actions = `
                <button onclick="cancelAppointment(${appointment.id})">
                Cancel Appointment
                </button>

                <button onclick="rescheduleAppointment(
                ${appointment.id},
                ${appointment.salonId},
                ${appointment.serviceId}
                )">
                Reschedule
                </button>
            `;
        }

        if ( appointment.status === 'completed' && appointment.paymentStatus === 'paid') {
        
            if (appointment.review) {
                
                actions = `
                <div class="review-box">
                    <p>
                    <strong>Your Rating:</strong>
                    ${appointment.review.rating}/5
                    </p>

                    <p>
                    <strong>Your Review:</strong>
                    ${appointment.review.comment}
                    </p>

                    ${
                        !appointment.review.staffResponse
                            ? `
                            <button onclick="openEditReviewPage(${appointment.review.id})">
                                Edit Review
                            </button>

                            <button onclick="deleteReview(${appointment.review.id})">
                                Delete Review
                            </button>
                            `
                            : ''
                    }

                    ${
                        appointment.review.staffResponse
                            ? `
                            <p>
                                <strong>Staff Response:</strong>
                                ${appointment.review.staffResponse}
                            </p>
                            `
                            : `
                            <p>
                                <strong>Staff Response:</strong>
                                No response yet
                            </p>
                            `
                    }
                </div>
                `;

            } else {

                actions = `
                <button onclick="openReviewPage(${appointment.id})">
                    Leave Review
                </button>
                `;
            }
        }

        div.innerHTML = `
        <h3>${appointment.service.name}</h3>
        <p><strong>Salon:</strong> ${appointment.salon.name}</p>
        <p><strong>Staff:</strong> ${appointment.staff.name}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.appointment_time}</p>
        <p><strong>Price:</strong> ₹${appointment.bookingPrice || appointment.service.price}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>
        <p><strong>Payment:</strong> ${appointment.paymentStatus}</p>
        ${
            appointment.invoice? `<p><a href="${appointment.invoice.pdfPath}" target="_blank">Download Invoice</a></p>`: ''
        }

        ${actions}
        `;

        container.appendChild(div);
    });
}

function openReviewPage(appointmentId) {
  window.location.href = `/user/review?appointmentId=${appointmentId}`;
}

function openEditReviewPage(reviewId) {
  window.location.href = `/user/review?reviewId=${reviewId}`;
}

async function deleteReview(reviewId) {
  const confirmDelete = confirm('Are you sure you want to delete this review?');

  if (!confirmDelete) {
    return;
  }

  try {
    await axios.delete(`/user/reviews/${reviewId}`);

    alert('Review deleted successfully');
    loadMyAppointments();

  } catch (error) {
    console.log('ERROR DELETING REVIEW --->', error);
    alert(error.response?.data?.message || 'Could not delete review');
  }
}

async function cancelAppointment(appointmentId) {
    try {
        await axios.patch(`/user/appointments/${appointmentId}/cancel`);

        alert("Appointment cancelled successfully");
        loadMyAppointments();

    } catch (error) {
        alert(error.response?.data?.message || "Could not cancel appointment");
    }
}

async function rescheduleAppointment(appointmentId, salonId, serviceId) {
    try {
         
        window.location.href = `/user/bookAppointment?salonId=${salonId}&serviceId=${serviceId}&rescheduleId=${appointmentId}`;  
        
    } catch (error) {
        alert(error.response?.data?.message || "Could not reschedule appointment");
    }
}

function viewSalonServices(salonId) {
    window.location.href = `/user/salon/${salonId}`;
}

document.getElementById('logout-btn').addEventListener('click', async (event) => {
     
    try {
        await axios.post('/user/logout');

        localStorage.removeItem('token');
        localStorage.removeItem('name');

        window.location.href = '/user/login';

    } catch (error) {
        console.log('LOGOUT ERROR --->', error);
    }
});