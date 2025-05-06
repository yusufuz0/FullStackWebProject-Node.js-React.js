document.addEventListener('DOMContentLoaded', () => {
    fetchSales();
  });
  
  function fetchSales() {
    fetch('http://localhost:5500/api/stripe/seller-sales', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const salesList = document.getElementById('salesList');
      if (!data.sales || data.sales.length === 0) {
        salesList.innerHTML = '<p>No sales data found.</p>';
        return;
      }
  
      data.sales.forEach(sale => {
        const item = document.createElement('div');
        item.classList.add('sale-item');
        item.innerHTML = `
          <h3>Product Title: ${sale.productTitle}</h3>
          <p>Quantity Sold: ${sale.quantitySold}</p>
          <p>Sold on: ${new Date(sale.lastSoldAt).toLocaleString()}</p>
        `;
        salesList.appendChild(item);
      });
    })
    .catch(err => {
      console.error('Failed to fetch sales:', err);
    });
  }
  