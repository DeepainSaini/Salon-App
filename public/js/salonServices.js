window.addEventListener('DOMContentLoaded', async () => {
    try {
        const pathParts = window.location.pathname.split('/');
        const salonId = pathParts[pathParts.length - 1];

        const response = await axios.get(`/user/salon/${salonId}/services`);

        showSalonDetails(response.data.salon);
        showServices(response.data.services, salonId);

    } catch (error) {
        console.log("ERROR LOADING SALON SERVICES ---> ", error);
    }
});

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

            <button onclick="bookService(${salonId}, ${service.id})">
                Book Now
            </button>
        `;

        servicesList.appendChild(serviceCard);
    });
}

function bookService(salonId, serviceId) {
    window.location.href = `/user/bookAppointment?salonId=${salonId}&serviceId=${serviceId}`;
}