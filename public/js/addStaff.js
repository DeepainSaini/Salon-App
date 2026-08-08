window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await axios.get('/admin/data-for-staff');

        const services = response.data.services;
        const salon = response.data.salon;
        const servicesList = document.getElementById('services-checkbox-list');

        services.forEach((service) => {
            const label = document.createElement('label');

            label.innerHTML = `
                <input type="checkbox" name="serviceIds" value="${service.id}">
                ${service.name}
            `;

            servicesList.appendChild(label);
        });

        const availableFrom = document.getElementById('available_from');
        const availableTo = document.getElementById('available_to');

        const openTime = salon.open_time.slice(0, 5);
        const closeTime = salon.close_time.slice(0, 5);

        availableFrom.min = openTime;
        availableFrom.max = closeTime;
        availableFrom.value = openTime;

        availableTo.min = openTime;
        availableTo.max = closeTime;
        availableTo.value = closeTime;

    } catch (error) {
        console.log("ERROR LOADING SERVICES ---> ", error);
    }
});


document.getElementById('add-staff-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const obj = {
        name: event.target.name.value,
        phone: event.target.phone.value,
        email: event.target.email.value,
        password: event.target.password.value,
        specialization: event.target.specialization.value,
        serviceIds: Array.from(document.querySelectorAll('input[name="serviceIds"]:checked')).map(input => input.value),
        available_from: event.target.available_from.value,
        available_to: event.target.available_to.value
    };

    try {
        await axios.post('/admin/addStaff', obj);
        window.location.href = '/admin/dashboard';
    } catch (error) {
        alert(error.response?.data?.message || "Could not add staff");
    }
});