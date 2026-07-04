
document.getElementsByTagName('h1')[0].innerHTML = `WELCOME ${localStorage.getItem('name')}`; 

document.getElementById('profile-form').addEventListener('submit',(event) => {

    event.preventDefault();
    const phone = event.target.phone.value;
    const preffered_contact_method = event.target.preffered_contact_method.value;
    const notes = event.target.notes.value;
    

    const obj = {
        phone: phone,
        notification_preference: preffered_contact_method,
        notes: notes
    }
    
    console.log(obj);

    axios.post('/user/profile',obj).then((result)=>{

        event.target.phone.value = "";
        event.target.preffered_contact_method.value = "";
        event.target.notes.value = "";

        window.location.href = '/user/dashboard';
       

    }).catch((error)=>{
        
        console.log("ERROR DURING SAVING PROFILE DETAILS ---> ",error);
    })
})