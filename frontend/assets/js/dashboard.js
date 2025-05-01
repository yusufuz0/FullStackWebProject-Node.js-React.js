async function loadProducts() {
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://localhost:5500/api/product/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        const productList = document.getElementById('productList');
        productList.innerHTML = '';
  
        data.products.forEach(product => {
          const productItem = document.createElement('div');
          productItem.classList.add('product-item');
          productItem.innerHTML = `
            <h3><a href="product-detail.html?id=${product.id}" class="product-title-link">${product.title}</a></h3>
            <p>Category: ${product.category}</p>
            <p>Price: $${product.price}</p>
            <a href="edit-product.html?id=${product.id}">Edit</a> | 
            <button onclick="deleteProduct('${product.id}')">Delete</button>
          `;
          productList.appendChild(productItem);
        });
      } else {
        document.getElementById('productList').innerHTML = '<p>No products available</p>';
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    }
  }
  
  // Sayfa yüklendiğinde ürünleri yükle
  window.onload = loadProducts;
  
  async function deleteProduct(productId) {
    const token = localStorage.getItem('token');
  
    try {
      const res = await fetch(`http://localhost:5500/api/product/delete/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (data.message === 'Product deleted successfully') {
        alert('Product deleted');
        loadProducts(); // Tekrar yükle
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  }
  