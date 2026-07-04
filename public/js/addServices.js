

document.getElementById('servicesForm').addEventListener('submit', async (event)=> {
    event.preventDefault();
    
    services = {
        name: event.target.service_name.value,
        description: event.target.service_description.value,
        price: event.target.service_price.value,
        duration: event.target.service_duration.value,
    };

  
    try {
        console.log(services);
        const response = await axios.post('/admin/add-services', services);
        
      
        window.location.href = '/admin/dashboard';
        
    } catch (error) {
        alert(error.response?.data?.message || "An error occurred while saving.");
        submitBtn.textContent = 'Complete Setup ✓';
        submitBtn.disabled = false;
    }
});
