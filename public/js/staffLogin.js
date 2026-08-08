document.getElementById('staff-login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const response = await axios.post('/staff/login', {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    });

    localStorage.setItem('staffToken', response.data.token);

    if (response.data.mustChangePassword) {
      window.location.href = '/staff/change-password';
    } else {
      window.location.href = '/staff/dashboard';
    }

  } catch (error) {
    console.log('STAFF LOGIN ERROR --->', error);
    alert(error.response?.data?.message || 'Could not login');
  }
});