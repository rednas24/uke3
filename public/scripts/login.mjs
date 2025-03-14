async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = ''; // Reset error message
    
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        alert('Login successful');
        window.location.replace('/home'); // Redirect after login
    } else {
        errorMessage.textContent = data.error;
    }
}

// Expose login function globally
window.login = login;
