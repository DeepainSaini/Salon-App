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

    appointments.forEach((appointment) => {
        const div = document.createElement('div');
        div.className = 'appointment-card';

        div.innerHTML = `
            <h3>${appointment.service.name}</h3>
            <p><strong>Salon:</strong> ${appointment.salon.name}</p>
            <p><strong>Staff:</strong> ${appointment.staff.name}</p>
            <p><strong>Date:</strong> ${appointment.appointment_date}</p>
            <p><strong>Time:</strong> ${appointment.appointment_time}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>

            ${appointment.status === 'booked' ? `
                <button onclick="cancelAppointment(${appointment.id})">
                    Cancel Appointment
                </button>
            ` : ''}

            <button onclick="rescheduleAppointment(${appointment.id}, ${appointment.salonId}, ${appointment.serviceId})">
                Reschedule
            </button>

        `;

        

        appointmentsList.appendChild(div);
    });
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
        await axios.patch(`/user/appointments/${appointmentId}/cancel`);

        window.location.href = `/user/bookAppointment?salonId=${salonId}&serviceId=${serviceId}`;

    } catch (error) {
        alert(error.response?.data?.message || "Could not reschedule appointment");
    }
}

function viewSalonServices(salonId) {
    window.location.href = `/user/salon/${salonId}`;
}