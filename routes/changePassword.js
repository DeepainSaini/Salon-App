document.getElementById('change-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await axios.patch('/user/change-password', {
      oldPassword: document.getElementById('oldPassword').value,
      newPassword: document.getElementById('newPassword').value
    });

    alert('Password changed successfully');
    window.location.href = '/user/dashboard';

  } catch (error) {
    alert(error.response?.data?.message || 'Could not change password');
  }
});