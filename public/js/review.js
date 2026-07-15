const params = new URLSearchParams(
  window.location.search
);

const appointmentId = params.get('appointmentId');
const message = document.getElementById('review-message');


document.getElementById('review-form').addEventListener('submit', async (event) => {
    
    event.preventDefault();

    try{
        const rating = event.target.rating.value;
        const comment = event.target.comment.value;

        const obj = {
            appointmentId: Number(appointmentId),
            rating: Number(rating),
            comment: comment
        };

        await axios.post('/user/review',obj);
        alert("Review Submitted");

        window.location.href = '/user/dashboard';

    }catch (error) {
        console.log('ERROR SUBMITTING REVIEW --->', error);

        message.textContent =error.response?.data?.message || 'Could not submit review';
    } 

    
})