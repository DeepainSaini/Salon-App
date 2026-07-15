const params = new URLSearchParams(window.location.search);
const rescheduleId = params.get('rescheduleId');
const salonId = params.get('salonId');
const serviceId = params.get('serviceId');

const cashfree = Cashfree({
    mode: "sandbox",
});

document.getElementById('check-slots-btn').addEventListener('click', async () => {
    const date = document.getElementById('appointment-date').value;

    if (!date) {
        alert("Please select a date");
        return;
    }

    try {
       
        let url =  `/user/available-slots?salonId=${salonId}&serviceId=${serviceId}&date=${date}`;
        if (rescheduleId) {
        url += `&excludeAppointmentId=${rescheduleId}`;
        }

        const response = await axios.get(url);

        showSlots(response.data.slots, date);

    } catch (error) {
        console.log("ERROR GETTING SLOTS ---> ", error);
        alert(error.response?.data?.message || "Could not load slots");
    }
});

function showSlots(slots, date) {
    const slotsList = document.getElementById('slots-list');

    if (slots.length === 0) {
        slotsList.innerHTML = `<p class="empty-message">No slots available.</p>`;
        return;
    }

    slotsList.innerHTML = "";

    slots.forEach((slot) => {
        const button = document.createElement('button');
        button.className = 'slot-btn';
        button.textContent = `${slot.time} - ${slot.staffName}`;

        button.addEventListener('click', () => {
            bookAppointment(slot, date);
        });

        slotsList.appendChild(button);
    });
}

async function bookAppointment(slot, date) {
    try {

         if (rescheduleId) {

            await axios.patch(
                `/user/appointments/reschedule`,
                {
                    staffId: slot.staffId,
                    appointment_date: date,
                    appointment_time: slot.time,
                    appointmentId: rescheduleId
                }
            );

            alert('Appointment rescheduled successfully');
            window.location.href = '/user/dashboard';
            return;
        }

        
        const response = await axios.post('/user/bookAppointment', {
            salonId: salonId,
            serviceId: serviceId,
            staffId: slot.staffId,
            appointment_date: date,
            appointment_time: slot.time
        });

        const { paymentSessionId } = response.data;

        const checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: "_self",
        };

        await cashfree.checkout(checkoutOptions);

        } catch (error) {
            console.log("ERROR BOOKING/PAYMENT ---> ", error);
            alert(error.response?.data?.message || "Could not start payment");
        }
}