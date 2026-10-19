let servicesPage = 1;
const servicesLimit = 10;
let servicesTotalPages = 1;
let salonId;

window.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    salonId = pathParts[pathParts.length - 1];
    loadSalonServices();
});

async function loadSalonServices() {
    try {
        const response = await axios.get(
            `/user/salon/${salonId}/services?page=${servicesPage}&limit=${servicesLimit}`
        );

        showSalonDetails(response.data.salon);
        showServices(response.data.services, salonId);
        servicesTotalPages = response.data.pagination?.totalPages || 1;
        showServicesPagination();

    } catch (error) {
        console.log("ERROR LOADING SALON SERVICES ---> ", error);
    }
}

function showSalonDetails(salon) {
    document.getElementById('salon-name').textContent = salon.name;
    document.getElementById('salon-description').textContent = salon.description || '';
    document.getElementById('salon-address').textContent = salon.address || '';
    document.getElementById('salon-city').textContent = salon.city || '';
    document.getElementById('salon-phone').textContent = salon.phone || '';
    document.getElementById('salon-timing').textContent = `${salon.open_time} - ${salon.close_time}`;
}

function showServices(services, salonId) {
    const servicesList = document.getElementById('services-list');

    if (services.length === 0) {
        servicesList.innerHTML = `<p class="empty-message">No services available.</p>`;
        return;
    }

    servicesList.innerHTML = "";

    services.forEach((service) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';

        serviceCard.innerHTML = `
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <p><strong>Duration:</strong> ${service.duration} minutes</p>
            <p><strong>Price:</strong> ₹${service.price}</p>

            <button class="book-service-btn" data-service-id="${service.id}">
                Book Now
            </button>
        `;

        serviceCard.querySelector('.book-service-btn').addEventListener('click', () => {
            bookService(salonId, service.id);
        });

        servicesList.appendChild(serviceCard);
    });
}

function bookService(salonId, serviceId) {
    window.location.href = `/user/bookAppointment?salonId=${salonId}&serviceId=${serviceId}`;
}

function showServicesPagination() {
    const paginationDiv = document.getElementById('services-pagination');

    if (!paginationDiv) {
        return;
    }

    paginationDiv.innerHTML = `
        <button id="services-prev-page" ${servicesPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${servicesPage} of ${servicesTotalPages || 1}</span>
        <button id="services-next-page" ${servicesPage >= servicesTotalPages ? 'disabled' : ''}>Next</button>
    `;

    document.getElementById('services-prev-page').addEventListener('click', () => {
        if (servicesPage > 1) {
            servicesPage--;
            loadSalonServices();
        }
    });

    document.getElementById('services-next-page').addEventListener('click', () => {
        if (servicesPage < servicesTotalPages) {
            servicesPage++;
            loadSalonServices();
        }
    });
}
