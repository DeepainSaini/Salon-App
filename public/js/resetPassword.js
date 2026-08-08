document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert('New password and confirm password do not match');
    return;
  }

  const pathParts = window.location.pathname.split('/');
  const resetId = pathParts[pathParts.length - 1];

  try {
    await axios.post(`/user/reset-password/${resetId}`, {
      newPassword
    });

    alert('Password reset successfully');
    window.location.href = '/user/login';

  } catch (error) {
    console.log('RESET PASSWORD ERROR --->', error);
    alert(error.response?.data?.message || 'Could not reset password');
  }
});