document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const content = document.getElementById('content-admin');

  if (!token) {
    content.innerHTML = '<p class="error">Unauthorized: Please log in as admin.</p>';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  fetchUserCounts();
  fetchSalesReport();
  fetchLatestOrders();
  fetchSellersAndProducts();



  // 1. Fetch user counts
async function fetchUserCounts() {
  try {
    const res = await fetch('http://localhost:5500/api/admin/user-counts', { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch');

    const userCountsSection = document.createElement('section');
    userCountsSection.className = 'admin-section';

  userCountsSection.innerHTML = `
    <h2>User Summary</h2>
    <div style="display: flex; align-items: flex-start; flex-wrap: wrap;">
      <div style="flex: 1; font-size: 19px;">
        <p><strong>Total Customers:</strong> ${data.customers}</p>
        <p><strong>Total Sellers:</strong> ${data.sellers}</p>
      </div>
      <div style="width: 450px; height: 450px; margin-left: auto;">
        <canvas id="userPieChart"></canvas>
      </div>
    </div>
  `;


    content.appendChild(userCountsSection);

    // Pasta grafiği oluştur
    const ctx = document.getElementById('userPieChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Customers', 'Sellers'],
        datasets: [{
          data: [data.customers, data.sellers],
          backgroundColor: ['rgb(53, 189, 8)', 'rgb(255, 157, 0)'],
          hoverOffset: 15
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'User Distribution'
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 50
            }
          }
        }
      }
    });

  } catch (err) {
    console.error('Error fetching user counts:', err);
  }
}



// 2. Fetch sellers and products
async function fetchSellersAndProducts() {
  const messageEl = document.getElementById('Message');
  try {
    const res = await fetch('http://localhost:5500/api/admin/sellers-products', { headers });
    const sellers = await res.json();
    if (!res.ok) throw new Error(sellers.message || 'Failed to fetch');

    const section = document.createElement('section');
    section.className = 'admin-section';
    section.innerHTML = `<h2>Sellers and Products</h2>`;

    sellers.forEach(seller => {
      const sellerDiv = document.createElement('div');
      sellerDiv.className = 'seller-block';
      sellerDiv.innerHTML = `<h3>${seller.sellerEmail}</h3>`;

      seller.products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-block';
        productDiv.style.cursor = 'pointer';  // Tıklanabilir olduğunu gösterir
        productDiv.innerHTML = `
          <p><strong>Title:</strong> ${product.title}</p>
          <p><strong>Price:</strong> £${product.price}</p>
          <button class="delete-btn" data-id="${product.id}">Delete</button>
        `;

        // Ürün bloğuna tıklayınca detay sayfasına yönlendir
        productDiv.addEventListener('click', (e) => {
          // Delete butonuna tıklanıyorsa yönlendirmeyi engelle
          if (e.target.classList.contains('delete-btn')) return;
          window.location.href = `/frontend/pages/view-product.html?id=${product.id}`;
        });

        sellerDiv.appendChild(productDiv);
      });

      section.appendChild(sellerDiv);
    });

    content.appendChild(section);

    // Event delegation for delete buttons (silme işlemi)
    section.addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');

        try {
          const res = await fetch('http://localhost:5500/api/admin/delete-product', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ productId: id })
          });
          const data = await res.json();
          if (res.ok) {
            e.target.closest('.product-block').remove();

            // Başarı mesajı göster
            messageEl.textContent = data.message || 'Product deleted';
            messageEl.style.color = 'green';
            messageEl.style.display = 'block';

            setTimeout(() => {
              messageEl.textContent = '';
              messageEl.style.display = 'none';
            }, 3000);
          } else {
            alert(data.error || 'Failed to delete product.');
            // Hata mesajı göster
            messageEl.textContent = data.message || 'Failed to delete product.';
            messageEl.style.color = 'red';
            messageEl.style.display = 'block';

            setTimeout(() => {
              messageEl.textContent = '';
              messageEl.style.display = 'none';
            }, 3000);
          }
        } catch (err) {
          console.error('Delete error:', err);
        }
      }
    });

  } catch (err) {
    console.error('Error fetching sellers and products:', err);
  }
}



  // 3. Fetch sales report
async function fetchSalesReport() {
  try {
    const res = await fetch('http://localhost:5500/api/admin/sales-report', { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch');

    const section = document.createElement('section');
    section.className = 'admin-section';
    section.innerHTML = `<h2>Sales Report</h2>`;

    const productSalesMap = new Map();  // title -> quantity
    const sellerEarnings = []; // { email, grossEarned }
    let totalPlatformRevenue = 0;
    let totalGrossEarned = 0;

    Object.values(data).forEach(seller => {
      let sellerGross = 0;

      Object.values(seller.products).forEach(product => {
        const current = productSalesMap.get(product.title) || 0;
        productSalesMap.set(product.title, current + product.quantity);

        sellerGross += product.total;
        totalPlatformRevenue += product.total * 0.2;
      });

      totalGrossEarned += sellerGross;

      sellerEarnings.push({
        email: seller.email,
        grossEarned: sellerGross
      });

      seller.grossEarned = sellerGross;
      seller.netEarned = sellerGross * 0.8;
    });

    const topProducts = [...productSalesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topSellers = sellerEarnings
      .sort((a, b) => b.grossEarned - a.grossEarned)
      .slice(0, 5);

    const chartWrapper = document.createElement('div');
    chartWrapper.style.display = 'flex';
    chartWrapper.style.gap = '40px';
    chartWrapper.style.flexWrap = 'wrap';
    chartWrapper.style.marginBottom = '30px';

    chartWrapper.innerHTML = `
      <div style="flex: 1; min-width: 300px;">
        <canvas id="topProductsChart"></canvas>
      </div>
      <div style="flex: 1; min-width: 300px;">
        <canvas id="topSellersChart"></canvas>
      </div>
    `;

    section.appendChild(chartWrapper);

    const productCtx = chartWrapper.querySelector('#topProductsChart').getContext('2d');
    new Chart(productCtx, {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p[0]),
        datasets: [{
          label: 'Quantity Sold',
          data: topProducts.map(p => p[1]),
          backgroundColor: 'rgba(76, 221, 221, 0.6)',
          maxBarThickness: 100
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Top 5 Best-Selling Products' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const sellerCtx = chartWrapper.querySelector('#topSellersChart').getContext('2d');
    new Chart(sellerCtx, {
      type: 'bar',
      data: {
        labels: topSellers.map(s => s.email),
        datasets: [{
          label: 'Gross Earned (£)',
          data: topSellers.map(s => s.grossEarned.toFixed(2)),
          backgroundColor: 'rgba(0, 255, 76, 0.6)',
          maxBarThickness: 100
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Top 5 Earning Sellers (Gross)' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    Object.entries(data).forEach(([sellerId, sellerData]) => {
      const sellerDiv = document.createElement('div');
      sellerDiv.className = 'seller-report';

      const paidNet = sellerData.payments.paid * 0.8;
      const pendingNet = sellerData.payments.pending * 0.8;
      const platformEarnings = sellerData.grossEarned * 0.2;

      sellerDiv.innerHTML = `
        <h3>Seller: ${sellerData.email}</h3>
        <p><strong>Gross Earned:</strong> £${sellerData.grossEarned.toFixed(2)}</p>
        <p><strong>Net Earned (Seller 80%):</strong> £${sellerData.netEarned.toFixed(2)}</p>
        <p><strong>Platform Revenue from this Seller (20%):</strong> £${platformEarnings.toFixed(2)}</p>
        <p><strong>Paid to Seller (Net):</strong> £${paidNet.toFixed(2)}</p>
        <p><strong>Pending Payment (Net):</strong> £${pendingNet.toFixed(2)}</p>
      `;

      const productList = document.createElement('ul');
      productList.className = 'product-report';

      Object.entries(sellerData.products).forEach(([productId, p]) => {
        const productRevenue = p.total;
        const platformShare = productRevenue * 0.2;
        const sellerShare = productRevenue * 0.8;

        const item = document.createElement('li');
        item.innerHTML = `
          ${p.title} &nbsp; –-> &nbsp;&nbsp; Quantity: ${p.quantity}, &nbsp;&nbsp;  Total: £${productRevenue.toFixed(2)}, 
           &nbsp;&nbsp;  Seller: £${sellerShare.toFixed(2)}, &nbsp;&nbsp; Platform: £${platformShare.toFixed(2)}
        `;
        productList.appendChild(item);
      });

      sellerDiv.appendChild(productList);
      section.appendChild(sellerDiv);
    });

    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `
     <br> 
     <p><strong>Total Gross Earned:</strong> £${totalGrossEarned.toFixed(2)}</p>
     <p><strong>Total Platform Revenue (20% cut):</strong> £${totalPlatformRevenue.toFixed(2)} </p>
    `;
    section.appendChild(summaryDiv);

    content.appendChild(section);
  } catch (err) {
    console.error('Error fetching sales report:', err);
  }
}




// 4. Fetch latest 5 orders
async function fetchLatestOrders() {
  try {
    const res = await fetch('http://localhost:5500/api/admin/latest-orders', { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch latest orders');

    const section = document.createElement('section');
    section.className = 'admin-section';
    section.innerHTML = `<h2>Latest 5 Purchases</h2>`;

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="text-align:left; padding: 8px;">Seller</th>
          <th style="text-align:left; padding: 8px;">Customer</th>
          <th style="text-align:left; padding: 8px;">Product</th>
          <th style="text-align:left; padding: 8px;">Price</th>
          <th style="text-align:left; padding: 8px;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(order => `
          <tr>
            <td style="padding: 8px;">${order.sellerEmail}</td>
            <td style="padding: 8px;">${order.buyerEmail}</td>
            <td style="padding: 8px;">${order.productTitle}</td>
            <td style="padding: 8px;">£${order.price.toFixed(2)}</td>
            <td style="padding: 8px;">${new Date(order.date).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    section.appendChild(table);
    content.appendChild(section);

  } catch (err) {
    console.error('Error fetching latest orders:', err);
  }
}


});
