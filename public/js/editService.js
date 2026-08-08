const pathParts = window.location.pathname.split('/');
const serviceId = pathParts[pathParts.indexOf('services') + 1];

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get(`/admin/services/${serviceId}/data`);

    const service = response.data.service;

    document.getElementById('service_name').value = service.name || '';
    document.getElementById('service_description').value = service.description || '';
    document.getElementById('service_price').value = service.price || '';
    document.getElementById('service_duration').value = service.duration || '';
    document.getElementById('available_from').value = service.available_from ? service.available_from.slice(0, 5) : '';
    document.getElementById('available_to').value = service.available_to ? service.available_to.slice(0, 5) : '';

  } catch (error) {
    console.log('ERROR LOADING SERVICE --->', error);
    alert(error.response?.data?.message || 'Could not load service');
  }
});

document.getElementById('servicesForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const serviceData = {
    name: document.getElementById('service_name').value,
    description: document.getElementById('service_description').value,
    price: document.getElementById('service_price').value,
    duration: document.getElementById('service_duration').value,
    available_from: document.getElementById('available_from').value,
    available_to: document.getElementById('available_to').value
  };

  try {
    await axios.patch(`/admin/services/${serviceId}`, serviceData);

    alert('Service updated successfully');
    window.location.href = '/admin/dashboard';

  } catch (error) {
    console.log('ERROR UPDATING SERVICE --->', error);
    alert(error.response?.data?.message || 'Could not update service');
  }
});