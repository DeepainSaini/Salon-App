let appointmentPage = 1;
const appointmentLimit = 10;
let appointmentTotalPages = 1;
let salonPage = 1;
const salonLimit = 10;
let salonTotalPages = 1;
let currentSalonSearch = '';

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
    salonPage = 1;
    loadSalons(search);
});

document.getElementById('clear-search-btn').addEventListener('click', () => {
    document.getElementById('salon-search-input').value = '';
    salonPage = 1;
    loadSalons();
});

let searchTimer;

document.getElementById('salon-search-input').addEventListener('input', (event) => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
        const search = event.target.value.trim();
        salonPage = 1;
        loadSalons(search);
    }, 300);
});

async function loadSalons(search = '') {
    try {
        currentSalonSearch = search;
        const response = await axios.get(`/user/dashboard-data?search=${encodeURIComponent(currentSalonSearch)}&page=${salonPage}&limit=${salonLimit}`);
        const salons = response.data.salons;
        const pagination = response.data.pagination;
        salonTotalPages = pagination.totalPages;
        showSalons(salons);
        showSalonPagination();
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

            <button class="view-services-btn" data-salon-id="${salon.id}">
                View Services
            </button>
        `;

        salonCard.querySelector('.view-services-btn').addEventListener('click', () => {
            viewSalonServices(salon.id);
        });

        salonsList.appendChild(salonCard);
    });
}

async function loadMyAppointments() {
    try {
        const response = await axios.get(`/user/my-appointments?page=${appointmentPage}&limit=${appointmentLimit}`);
        const appointments = response.data.appointments;
        const pagination = response.data.pagination;
        appointmentTotalPages = pagination.totalPages;
        showMyAppointments(appointments);
        showAppointmentPagination();
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
                <button class="cancel-appointment-btn" data-appointment-id="${appointment.id}">
                Cancel Appointment
                </button>

                <button 
                    class="reschedule-appointment-btn" 
                    data-appointment-id="${appointment.id}"
                    data-salon-id="${appointment.salonId}"
                    data-service-id="${appointment.serviceId}"
                >
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
                            <button class="edit-review-btn" data-review-id="${appointment.review.id}">
                                Edit Review
                            </button>

                            <button class="delete-review-btn" data-review-id="${appointment.review.id}">
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
                <button class="leave-review-btn" data-appointment-id="${appointment.id}">
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

        const cancelBtn = div.querySelector('.cancel-appointment-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                cancelAppointment(appointment.id);
            });
        }

        const rescheduleBtn = div.querySelector('.reschedule-appointment-btn');
        if (rescheduleBtn) {
            rescheduleBtn.addEventListener('click', () => {
                rescheduleAppointment(appointment.id, appointment.salonId, appointment.serviceId);
            });
        }

        const editReviewBtn = div.querySelector('.edit-review-btn');
        if (editReviewBtn) {
            editReviewBtn.addEventListener('click', () => {
                openEditReviewPage(appointment.review.id);
            });
        }

        const deleteReviewBtn = div.querySelector('.delete-review-btn');
        if (deleteReviewBtn) {
            deleteReviewBtn.addEventListener('click', () => {
                deleteReview(appointment.review.id);
            });
        }

        const leaveReviewBtn = div.querySelector('.leave-review-btn');
        if (leaveReviewBtn) {
            leaveReviewBtn.addEventListener('click', () => {
                openReviewPage(appointment.id);
            });
        }

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

function showAppointmentPagination() {
  const paginationDiv = document.getElementById('appointments-pagination');

  if (!paginationDiv) return;

  paginationDiv.innerHTML = `
    <button id="prev-appointment-page" ${appointmentPage === 1 ? 'disabled' : ''}>Previous</button>
    <span>Page ${appointmentPage} of ${appointmentTotalPages || 1}</span>
    <button id="next-appointment-page" ${appointmentPage >= appointmentTotalPages ? 'disabled' : ''}>Next</button>
  `;

  document.getElementById('prev-appointment-page').addEventListener('click', () => {
    if (appointmentPage > 1) {
      appointmentPage--;
      loadMyAppointments();
    }
  });

  document.getElementById('next-appointment-page').addEventListener('click', () => {
    if (appointmentPage < appointmentTotalPages) {
      appointmentPage++;
      loadMyAppointments();
    }
  });
}

function showSalonPagination() {
  const paginationDiv = document.getElementById('salons-pagination');

  if (!paginationDiv) return;

  paginationDiv.innerHTML = `
    <button id="prev-salon-page" ${salonPage === 1 ? 'disabled' : ''}>Previous</button>
    <span>Page ${salonPage} of ${salonTotalPages || 1}</span>
    <button id="next-salon-page" ${salonPage >= salonTotalPages ? 'disabled' : ''}>Next</button>
  `;

  document.getElementById('prev-salon-page').addEventListener('click', () => {
    if (salonPage > 1) {
      salonPage--;
      loadSalons(currentSalonSearch);
    }
  });

  document.getElementById('next-salon-page').addEventListener('click', () => {
    if (salonPage < salonTotalPages) {
      salonPage++;
      loadSalons(currentSalonSearch);
    }
  });
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
