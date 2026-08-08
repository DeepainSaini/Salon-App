document.getElementById('staff-change-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    await axios.patch('/staff/change-password', {
      oldPassword,
      newPassword
    });

    alert('Password changed successfully');
    window.location.href = '/staff/dashboard';

  } catch (error) {
    alert(error.response?.data?.message || 'Could not change password');
  }
});