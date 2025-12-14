// Replace with your Railway backend URL after deployment
const API_URL = 'https://your-backend-url.railway.app/api/register';

const form = document.getElementById('registrationForm');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            message.className = 'message success';
            message.textContent = data.message || 'Registration successful!';
            message.style.display = 'block';
            form.reset();
        } else {
            message.className = 'message error';
            message.textContent = data.message || 'Registration failed!';
            message.style.display = 'block';
        }
    } catch (error) {
        message.className = 'message error';
        message.textContent = 'Network error. Please try again.';
        message.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});