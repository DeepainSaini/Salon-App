document.getElementsByTagName('h1')[0].innerHTML = `WELCOME ${localStorage.getItem('name')}`; 

window.addEventListener('DOMContentLoaded', async () => {
    try {
        
        const response = await axios.get('/user/dashboard-data');
    
        showSalons(response.data.salons);
        loadMyAppointments();

    } catch (error) {
        console.log("ERROR LOADING CUSTOMER DASHBOARD ---> ", error);
    }
});

function showSalons(salons) {
    const salonsList = document.getElementById('salons-list');

    salonsList.innerHTML = "";

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
        <p><strong>Status:</strong> ${appointment.status}</p>
        <p><strong>Payment:</strong> ${appointment.paymentStatus}</p>

        ${actions}
        `;

        container.appendChild(div);
    });
}

function openReviewPage(appointmentId) {
  window.location.href = `/user/review?appointmentId=${appointmentId}`;
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