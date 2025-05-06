document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5500/api/stripe/purchases', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('purchasesList');
      if (!data.items.length) {
        list.innerHTML = "<p>No purchases yet.</p>";
        return;
      }

      data.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'purchase-item';
        div.innerHTML = `
          <h4><a href="view-product.html?id=${item.productId}">${item.title} - ${item.purchasedAt}</a></h4>
        `;
        list.appendChild(div);
      });
    })
    .catch(err => console.error('Error loading purchases:', err));
  });