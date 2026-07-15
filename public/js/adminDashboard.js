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
      `;
    }

    if(appointment.status === 'completed' && appointment.review){

      if(appointment.review.staffResponse){
        
        reviewContent = `
          <div class="review-box">
            <p>
              <strong>Rating:</strong>
              ${appointment.review.rating}/5
            </p>

            <p>
              <strong>Customer Review:</strong>
              ${appointment.review.comment}
            </p>

            <p>
              <strong>Your Response:</strong>
              ${appointment.review.staffResponse}
            </p>
          </div>
        `;

      }else{
        
        reviewContent = `
          <div class="review-box">
            <p>
              <strong>Rating:</strong>
              ${appointment.review.rating}/5
            </p>

            <p>
              <strong>Customer Review:</strong>
              ${appointment.review.comment}
            </p>

            <textarea
              id="response-${appointment.review.id}"
              placeholder="Write your response">
            </textarea>

            <button onclick="submitResponse(
              ${appointment.review.id}
            )">
              Submit Response
            </button>
          </div>
        `;
      }
    }

    div.innerHTML = `
      <h3>${appointment.service.name}</h3>
      <p><strong>Customer:</strong> ${appointment.customer.name}</p>
      <p><strong>Contact Number: </strong> ${appointment.customer.phone}</p>
      <p><strong>Staff:</strong> ${appointment.staff.name}</p>
      <p><strong>Date:</strong> ${appointment.appointment_date}</p>
      <p><strong>Time:</strong> ${appointment.appointment_time}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>
      <p><strong>Payment:</strong> ${appointment.paymentStatus}</p>

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

async function submitResponse(reviewId) {
  
  const responseText = document.getElementById(`response-${reviewId}`).value.trim();

  if (!responseText) {
    alert('Please write a response');
    return;
  }

  try {
    
    await axios.patch(`/admin/reviews/${reviewId}/response`,{staffResponse: responseText});

    alert('Response submitted successfully');
    window.location.reload();

  } catch (error) {
    console.log('ERROR SUBMITTING RESPONSE --->', error);

    alert(error.response?.data?.message ||'Could not submit response');
  }
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