const API_BASE = "http://localhost:5500/api/stripe";


export async function createCheckoutSession(token) {
  const res = await fetch(`${API_BASE}/create-checkout-session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to create checkout session");
  }

  const data = await res.json();
  return data;
}


export async function fetchPurchases(token) {
  const res = await fetch(`${API_BASE}/purchases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch purchases");
  }

  const data = await res.json();
  return data.items || [];
}

export async function fetchSellerSales(token) {
  const res = await fetch(`${API_BASE}/seller-sales`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch seller sales");
  }

  return await res.json(); // { sales: [...], totalRevenue: 123 }
}

export async function createStripeLink(userId) {
  const res = await fetch(`${API_BASE}/create-account-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Stripe link creation failed");
  return await res.json(); // { url: ... }
}