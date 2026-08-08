const params = new URLSearchParams(
  window.location.search
);

const appointmentId = params.get('appointmentId');
const reviewId = params.get('reviewId');
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

        if (reviewId) {
            await axios.patch(`/user/reviews/${reviewId}`, {
                rating,
                comment
            });
        } else {
                await axios.post('/user/review', obj);
            }

        alert("Review Submitted");

        window.location.href = '/user/dashboard';

    }catch (error) {
        console.log('ERROR SUBMITTING REVIEW --->', error);

        message.textContent =error.response?.data?.message || 'Could not submit review';
    } 

    
})