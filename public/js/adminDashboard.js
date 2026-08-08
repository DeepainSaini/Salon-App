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
        showCustomers(appointments);
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
        </button>
        
        <button onclick="editService(${service.id})">Edit</button>`;

        servicesListDiv.appendChild(serviceDiv);
    });
}

function editService(serviceId) {
  window.location.href = `/admin/services/${serviceId}/edit`;
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
            <p><strong>Assigned Service:</strong> ${staff.services && staff.services.length > 0 ? staff.services.map(service => service.name).join(', '): 'Not assigned'}</p>
            <p><strong>Available:</strong> ${staff.available_from} - ${staff.available_to}</p>
            <p><strong>Status:</strong> ${staff.is_active ? 'Active' : 'Inactive'}</p>

            <button onclick="toggleStaffStatus(${staff.id})">
                ${staff.is_active ? 'Deactivate' : 'Activate'}
            </button>
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

async function toggleStaffStatus(staffId) {
    try {
        await axios.patch(`/admin/staff/${staffId}/status`);
        window.location.reload();
    } catch (error) {
        console.log("ERROR UPDATING STAFF STATUS ---> ", error);
        alert("Could not update staff status");
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


function showCustomers(appointments) {
  const customersList = document.getElementById('customers-list');

  if (!customersList) {
    return;
  }

  const customersMap = {};

  appointments.forEach((appointment) => {
    const customer = appointment.customer;

    if (!customer) {
      return;
    }

    if (!customersMap[customer.id]) {
      customersMap[customer.id] = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
      };
    }

    customersMap[customer.id].totalAppointments++;

    if (appointment.status === 'completed') {
      customersMap[customer.id].completedAppointments++;
    }

    if (appointment.status === 'cancelled') {
      customersMap[customer.id].cancelledAppointments++;
    }
  });

  const customers = Object.values(customersMap);

  if (customers.length === 0) {
    customersList.innerHTML = `<p class="empty-message">No customers yet.</p>`;
    return;
  }

  customersList.innerHTML = '';

  customers.forEach((customer) => {
    const div = document.createElement('div');
    div.className = 'item-card';

    div.innerHTML = `
      <h3>${customer.name}</h3>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
      <p><strong>Total Appointments:</strong> ${customer.totalAppointments}</p>
      <p><strong>Completed:</strong> ${customer.completedAppointments}</p>
      <p><strong>Cancelled:</strong> ${customer.cancelledAppointments}</p>
      <button onclick="viewCustomerDetails(${customer.id})">
        View Details
      </button>
    `;

    customersList.appendChild(div);
  });
}

function viewCustomerDetails(customerId) {
  window.location.href = `/admin/customers/${customerId}`;
}


function showAppointments(appointments) {
    const appointmentsList = document.getElementById('appointments-list');

    if (appointments.length === 0) {
        appointmentsList.innerHTML = `<p class="empty-message">No appointments yet.</p>`;
        return;
    }

    appointmentsList.innerHTML = "";

    const upcoming = appointments.filter(
        appointment => appointment.status === 'booked'
    );

  const completed = appointments.filter(
        appointment => appointment.status === 'completed'
    );

  const cancelled = appointments.filter(
        appointment => appointment.status === 'cancelled'
    );

  appointmentsList.innerHTML = `
    <section>
      <h3>Upcoming Appointments</h3>
      <div id="admin-upcoming-list"></div>
    </section>

    <section>
      <h3>Completed Appointments</h3>
      <div id="admin-completed-list"></div>
    </section>

    <section>
      <h3>Cancelled Appointments</h3>
      <div id="admin-cancelled-list"></div>
    </section>
  `;

  renderAdminAppointments(
    upcoming,
    document.getElementById('admin-upcoming-list')
  );

  renderAdminAppointments(
    completed,
    document.getElementById('admin-completed-list')
  );

  renderAdminAppointments(
    cancelled,
    document.getElementById('admin-cancelled-list')
  );
}

function renderAdminAppointments(appointments, container) {
  
  if (appointments.length === 0) {
    container.innerHTML =
      `<p class="empty-message">No appointments.</p>`;
    return;
  }

  appointments.forEach((appointment) => {
    const div = document.createElement('div');
    div.className = 'appointment-card';

    let action = '';
    let reviewContent='';

    if (appointment.status === 'booked') {
      action = `
        <button onclick="markCompleted(${appointment.id})">
          Mark Completed
        </button>

        <button onclick="cancelAppointmentByAdmin(${appointment.id})">
          Cancel Appointment
        </button>

       <button onclick="editAppointment(${appointment.id})">
          Edit Appointment
       </button>
      `;
    }

    if (appointment.status === 'completed' && appointment.review) {
      reviewContent = `
        <div class="review-box">
          <p><strong>Rating:</strong> ${appointment.review.rating}/5</p>
          <p><strong>Customer Review:</strong> ${appointment.review.comment}</p>
          <p><strong>Staff Response:</strong> ${appointment.review.staffResponse || 'No response yet'}</p>
        </div>
      `;
    }

    div.innerHTML = `
      <h3>${appointment.service.name}</h3>
      <p><strong>Customer:</strong> ${appointment.customer.name}</p>
      <p><strong>Contact Number: </strong> ${appointment.customer.phone}</p>
      <p><strong>Staff:</strong> ${appointment.staff.name}</p>
      <p><strong>Date:</strong> ${appointment.appointment_date}</p>
      <p><strong>Time:</strong> ${appointment.appointment_time}</p>
      <p><strong>Price:</strong> ₹${appointment.bookingPrice || appointment.service.price}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>
      <p><strong>Payment:</strong> ${appointment.paymentStatus}</p>
      ${
        appointment.invoice? `<p><a href="${appointment.invoice.pdfPath}" target="_blank">Download Invoice</a></p>`: ''
      }

      ${action}
      ${reviewContent}
    `;

    container.appendChild(div);
  });
}

async function markCompleted(appointmentId) {
  try {
    await axios.patch(
      `/admin/appointments/${appointmentId}/complete`
    );

    alert('Appointment marked as completed');

    window.location.reload();

  } catch (error) {
    console.log(
      'ERROR MARKING APPOINTMENT COMPLETED --->',
      error
    );

    alert(
      error.response?.data?.message ||
      'Could not mark appointment as completed'
    );
  }
}

async function cancelAppointmentByAdmin(appointmentId) {
  const confirmCancel = confirm('Are you sure you want to cancel this appointment?');

  if (!confirmCancel) {
    return;
  }

  try {
    await axios.patch(`/admin/appointments/${appointmentId}/cancel`);

    alert('Appointment cancelled successfully');

    window.location.reload();

  } catch (error) {
    console.log('ERROR CANCELLING APPOINTMENT --->', error);

    alert(
      error.response?.data?.message ||
      'Could not cancel appointment'
    );
  }
}

function editAppointment(appointmentId) {
  window.location.href = `/admin/appointments/${appointmentId}/edit`;
}

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