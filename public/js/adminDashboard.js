window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await axios.get('/admin/dashboard-data');

        const salon = response.data.salon;
        const services = response.data.services;
        const staff = response.data.staff;
        const appointments = response.data.appointments;



        showSalonDetails(salon);
        showServices(services);
        showStaff(staff);
        showAppointments(appointments)

    } catch (error) {
        console.log("ERROR LOADING DASHBOARD ---> ", error);
    }
});

function showSalonDetails(salon) {
    const salonDetailsDiv = document.getElementById('salon-details');

    salonDetailsDiv.innerHTML = `
        <p><strong>Salon Name:</strong> ${salon.name}</p>
        <p><strong>Email:</strong> ${salon.email}</p>
        <p><strong>Phone:</strong> ${salon.phone}</p>
        <p><strong>Address:</strong> ${salon.address}</p>
        <p><strong>City:</strong> ${salon.city}</p>
        <p><strong>Opening Time:</strong> ${salon.open_time}</p>
        <p><strong>Closing Time:</strong> ${salon.close_time}</p>
    `;
}

function showServices(services) {
    const servicesListDiv = document.getElementById('services-list');

    if (services.length === 0) {
        servicesListDiv.innerHTML = `<p>No services added yet.</p>`;
        return;
    }

    servicesListDiv.innerHTML = "";

    services.forEach((service) => {
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'item-card';
        console.log("Activity status",service);

        serviceDiv.innerHTML = `<h3> ${service.name} -- ${service.description} -- ${service.duration} -- ₹${service.price} </h3> 
        <p>
            <strong>Status:</strong> 
            ${service.is_active ? 'Active' : 'Inactive'}
        </p>
        <button onclick="toggleServiceStatus(${service.id})">
            ${service.is_active ? 'Deactivate' : 'Activate'}
        </button> `;

        servicesListDiv.appendChild(serviceDiv);
    });
}

function showStaff(staffList) {
    const staffListDiv = document.getElementById('staff-list');

    if (staffList.length === 0) {
        staffListDiv.innerHTML = `<p>No staff added yet.</p>`;
        return;
    }

    staffListDiv.innerHTML = "";

    staffList.forEach((staff) => {
        const staffDiv = document.createElement('div');
        staffDiv.className = 'item-card';

        staffDiv.innerHTML = `
            <h3>${staff.name}</h3>
            <p><strong>Email:</strong> ${staff.email}</p>
            <p><strong>Phone:</strong> ${staff.phone}</p>
            <p><strong>Specialization:</strong> ${staff.specialization}</p>
            <p><strong>Assigned Service:</strong> ${staff.service ? staff.service.name : 'Not assigned'}</p>
            <p><strong>Available:</strong> ${staff.available_from} - ${staff.available_to}</p>
        `;

        staffListDiv.appendChild(staffDiv);
    });
}

async function toggleServiceStatus(serviceId) {
    try {
        await axios.patch(`/admin/services/${serviceId}/status`);


        window.location.reload();

    } catch (error) {
        console.log("ERROR UPDATING SERVICE STATUS ---> ", error);
        alert("Could not update service status");
    }
}

document.getElementById('add-service-btn').addEventListener('click', (event)=>{

    event.preventDefault();
    window.location.href = '/admin/add-services';
})

document.getElementById('add-staff-btn').addEventListener('click', (event)=>{

    event.preventDefault();
    window.location.href = '/admin/add-staff';
})


function showAppointments(appointments) {
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
            <p><strong>Customer:</strong> ${appointment.customer.name}</p>
            <p><strong>Staff:</strong> ${appointment.staff.name}</p>
            <p><strong>Date:</strong> ${appointment.appointment_date}</p>
            <p><strong>Time:</strong> ${appointment.appointment_time}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
        `;

        appointmentsList.appendChild(div);
    });
}