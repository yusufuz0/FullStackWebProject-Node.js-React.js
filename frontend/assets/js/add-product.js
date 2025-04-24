document.getElementById('addProductForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);  // Direkt formdan verileri al

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in!');
    return;
  }

console.log("STATE POİNT 1")

  try {
    const res = await fetch('http://localhost:5500/api/product/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // DİKKAT: 'Content-Type' ELLE YAZMIYORUZ!
      },
      body: formData,
    });

    console.log("STATE POİNT 2")
    const data = await res.json();
    console.log("STATE POİNT 3")

    if (!res.ok) {
      throw new Error(data.message || 'Failed to add product');
    }

    console.log(data);
    alert('Product added successfully!');
    window.location.href = '../pages/index.html';
  } 
  catch (err) {
    console.error('Error details: ', err);
    alert('Error adding product: ' + err.message);
  }
});
