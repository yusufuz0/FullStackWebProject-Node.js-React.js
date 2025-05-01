// frontend/scripts/products.js
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
  });
  
  function fetchProducts() {
    fetch('http://localhost:5500/api/product')
      .then(res => res.json())
      .then(data => {
        const productList = document.getElementById('productList');
        if (!data.products || data.products.length === 0) {
          productList.innerHTML = '<p>No products found.</p>';
          return;
        }
  
        data.products.forEach(product => {
          const item = document.createElement('div');
          item.classList.add('product-item');
          item.innerHTML = `
            <h3><a href="product-detail.html?id=${product.id}">${product.title}</a></h3>
            <p>${product.description.substring(0, 100)}...</p>
            <p>${product.category}</p>
            <p><strong>$${product.price}</strong></p>
          `;
          productList.appendChild(item);
        });
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
      });
  }
  