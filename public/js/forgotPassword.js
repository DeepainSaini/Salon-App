document.getElementById('forgot-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await axios.post('/user/forgot-password', {
      email: document.getElementById('email').value
    });

    alert('Reset link sent to your email');
    window.location.href = '/user/login';

  } catch (error) {
    console.log('FORGOT PASSWORD ERROR --->', error);
    alert(error.response?.data?.message || 'Could not send reset link');
  }
});