document.addEventListener('DOMContentLoaded', () => {
    fetchTopRatedProducts();
  });
  
  function fetchTopRatedProducts() {
    fetch('http://localhost:5500/api/product/top-rated')
      .then(res => res.json())
      .then(data => {
        const topRatedContainer = document.getElementById('top-rated-products');
        if (!data.products || data.products.length === 0) {
          topRatedContainer.innerHTML = '<p>No top-rated products available.</p>';
          return;
        }
  
        data.products.forEach(product => {
          const productItem = document.createElement('div');
          productItem.classList.add('product-item');
          productItem.innerHTML = `
            <h3><a href="product-detail.html?id=${product.id}">${product.title}</a></h3>
            <p>${product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No rating'} ⭐ (${product.ratingCount} votes)</p>
            <p>${product.description.substring(0, 100)}...</p>
            <p>${product.category}</p>
            <p><strong>£${product.price}</strong></p>
          `;
          topRatedContainer.appendChild(productItem);
        });
      })
      .catch(err => {
        console.error('Error fetching top-rated products:', err);
      });
  }
  