window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get('/user/profile/data');

    const user = response.data.user;

    document.getElementById('name').value = user.name || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('notification_preference').value = user.notification_preference || 'email';
    document.getElementById('notes').value = user.notes || '';

  } catch (error) {
    console.log("ERROR LOADING PROFILE --->", error);
    alert("Could not load profile");
  }
});

document.getElementById('edit-profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await axios.patch('/user/profile/update', {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      notification_preference: document.getElementById('notification_preference').value,
      notes: document.getElementById('notes').value
    });

    alert("Profile updated successfully");
    window.location.href = '/user/dashboard';

  } catch (error) {
    console.log("ERROR UPDATING PROFILE --->", error);
    alert(error.response?.data?.message || "Could not update profile");
  }
});