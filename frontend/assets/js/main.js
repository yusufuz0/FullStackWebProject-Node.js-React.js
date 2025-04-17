document.getElementById('testButton').addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      document.getElementById('response').innerText = data.message;
    } catch (error) {
      console.error(error);
      document.getElementById('response').innerText = 'Error connecting to backend';
    }
  });
  