
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit',(event)=>{

    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const obj = {
        email: email,
        password: password
    }
    console.log(obj);

    axios.post('/user/login',obj).then((result)=>{
       
        event.target.email.value = "";
        event.target.password.value = "";

        console.log(result.data);
        
        localStorage.setItem('name',result.data.fullName);
        if (result.data.role === 'Admin') {
            if (result.data.hasSalon) {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/admin/salonDetails';
            }
        }
        else if (result.data.isProfileComplete === true) {
            window.location.href = '/user/dashboard';
        }
        else {
            window.location.href = '/user/profile';
        }
        
          
    }).catch((error)=>{
        
        const errorDiv = document.getElementById('errormsg');

        if(error.response.data.message === "user with email does not exixt"){
              
            errorDiv.textContent = "USER DOES NOT EXIST."
            setTimeout(()=>{
                errorDiv.textContent = "";
            },4000);
        }

        if(error.response.data.message === "incorrect password"){
              
            errorDiv.textContent = "INCORRECT PASSWORD."
            setTimeout(()=>{
                errorDiv.textContent = "";
            },4000);
        }
        console.log("ERROR DURING LOGIN ---> ",error);
    })
})