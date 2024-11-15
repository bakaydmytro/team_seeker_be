submit.addEventListener('click', () => {

    const userData = {
        firstName: firstName.value.trim(),
        secondName: secondName.value.trim(),
        email: email.value.trim(),
        age: age.value.trim(),
        password: password.value.trim()
    };


    if (!userData.firstName || !userData.secondName || !userData.email || !userData.age || !userData.password) {
        alert("Please fill in all fields.");
        return;
    }


    fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData) 
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            console.log('User registered successfully:', data);
            alert('Registration successful!');
        } else {
            console.error('Error registering user:', data.error);
            alert(data.error);  
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});