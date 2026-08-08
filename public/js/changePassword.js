document.getElementById('change-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert('New password and confirm password do not match');
    return;
  }

  try {
    await axios.patch('/user/change-password', {
      oldPassword,
      newPassword
    });

    alert('Password changed successfully');
    window.location.href = '/user/dashboard';

  } catch (error) {
    console.log('CHANGE PASSWORD ERROR --->', error);
    alert(error.response?.data?.message || 'Could not change password');
  }
});