

document.getElementById('signupForm').addEventListener('submit',(event) => {

    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const role = event.target.role.value;

    const obj = {
        name: name,
        email: email,
        password: password,
        role: role
    }
    
    console.log(obj);

    axios.post('/user/signup',obj).then((result)=>{

        event.target.name.value = "";
        event.target.email.value = "";
        event.target.password.value = "";
        event.target.role.value = "";

        window.location.href = '/user/login';

    }).catch((error)=>{
        
        const errorDiv = document.getElementById('errormsg');

        if(error.response.data.message === "user with this email alredy exists"){

            errorDiv.textContent = "USER WITH THIS EMAIL ALREADY EXISTS."
            setTimeout(() => {
                errorDiv.textContent = "";
            }, 4000);
        }
        console.log("ERROR DURING SIGNUP ---> ",error);
    })
})