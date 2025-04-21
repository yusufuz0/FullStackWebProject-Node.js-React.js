const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const userType = document.getElementById('userType').value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, userType })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Registered successfully! Now you can login.');
      window.location.href = 'login.html';
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred');
  }
});
