document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const token = localStorage.getItem('token');
  
    if (!productId || !token) return;
  
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const priceInput = document.getElementById('price');
    const categoryInput = document.getElementById('category');
  
// Ürünü getirme
fetch(`http://localhost:5500/api/product/product/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(product => {
      titleInput.value = product.title;
      descriptionInput.value = product.description;
      priceInput.value = product.price;
  
      // Kategori dropdown'ında ilgili değeri seç
      const categorySelect = document.getElementById('category');
      categorySelect.value = product.category || "";
    })
    .catch(err => {
      console.error('Failed to fetch product:', err);
      alert('Failed to load product.');
    });
  
  
    // Güncelleme işlemi
    document.getElementById('editProductForm').addEventListener('submit', (e) => {
      e.preventDefault();
  
      const updatedData = {
        title: titleInput.value,
        description: descriptionInput.value,
        price: parseFloat(priceInput.value),
        category: categoryInput.value
      };
  
      fetch(`http://localhost:5500/api/product/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })
        .then(res => res.json())
        .then(response => {
          alert('Product updated successfully');
          window.location.href = 'dashboard.html';
        })
        .catch(err => {
          console.error('Update failed:', err);
          alert('Failed to update product.');
        });
    });
  });
  