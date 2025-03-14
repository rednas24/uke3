async function register() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageElement = document.getElementById('message');
    
    messageElement.textContent = '';
    
    if (!username || !password) {
        messageElement.textContent = 'Username and password are required!';
        return;
    }
    
    try {
        const response = await fetch('api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful');
            window.location.replace('/'); // Redirect after registration
        } else {
            messageElement.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        console.error('Registration failed:', error);
        messageElement.textContent = 'Failed to register. Please try again.';
    }
}

// Expose register function globally
window.register = register;

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    register();
});