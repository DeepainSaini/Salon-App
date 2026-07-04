

const step1Container = document.getElementById('step-1-container');


document.getElementById('step-1-form').addEventListener('submit', async (event)=> {
    event.preventDefault(); 

  
    salonDetails = {

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
        console.log(salonDetails);
        const response = await axios.post('/admin/salonDetails', salonDetails);
        
      
        window.location.href = '/admin/dashboard';
        
    } catch (error) {
        alert(error.response?.data?.message || "An error occurred while saving.");
        submitBtn.textContent = 'Complete Setup ✓';
        submitBtn.disabled = false;
    }

  
});




