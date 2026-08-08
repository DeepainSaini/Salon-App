window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get('/admin/salonDetails/data');
    const salon = response.data.salon;

    document.getElementById('salon_name').value = salon.name || '';
    document.getElementById('salon_description').value = salon.description || '';
    document.getElementById('salon_phone').value = salon.phone || '';
    document.getElementById('salon_email').value = salon.email || '';
    document.getElementById('salon_address').value = salon.address || '';
    document.getElementById('salon_city').value = salon.city || '';
    document.getElementById('salon_zipcode').value = salon.zip_code || '';
    document.getElementById('open_time').value = salon.open_time ? salon.open_time.slice(0, 5) : '';
    document.getElementById('close_time').value = salon.close_time ? salon.close_time.slice(0, 5) : '';

  } catch (error) {
    console.log('ERROR LOADING SALON DETAILS --->', error);
    alert(error.response?.data?.message || 'Could not load salon details');
  }
});

document.getElementById('step-1-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const salonDetails = {
    name: event.target.salon_name.value,
    city: event.target.salon_city.value,
    phone: event.target.salon_phone.value,
    description: event.target.salon_description.value,
    email: event.target.salon_email.value,
    address: event.target.salon_address.value,
    zipcode: event.target.salon_zipcode.value,
    open_time: event.target.open_time.value,
    close_time: event.target.close_time.value
  };

  try {
    await axios.patch('/admin/salonDetails', salonDetails);

    alert('Salon details updated successfully');
    window.location.href = '/admin/dashboard';

  } catch (error) {
    console.log('ERROR UPDATING SALON DETAILS --->', error);
    alert(error.response?.data?.message || 'Could not update salon details');
  }
});