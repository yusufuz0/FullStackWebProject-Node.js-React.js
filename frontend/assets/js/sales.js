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
      const totalRevenueEl = document.getElementById('totalRevenue');
      if (!data.sales || data.sales.length === 0) {
        salesList.innerHTML = '<p>No sales data found.</p>';
        return;
      }

      totalRevenueEl.textContent = `£${data.totalRevenue.toFixed(2)}`;
  
      data.sales.forEach(sale => {
        const item = document.createElement('div');
        item.classList.add('sale-item');
        item.innerHTML = `
          <h3>Product Title: ${sale.productTitle}</h3>
          <p>Quantity Sold: ${sale.quantitySold}</p>
          <p>Price: £${sale.price}</p> 
          <p>Sold on: ${new Date(sale.lastSoldAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}</p>
        `;
        salesList.appendChild(item);
      });
    })
    .catch(err => {
      console.error('Failed to fetch sales:', err);
    });
  }
  