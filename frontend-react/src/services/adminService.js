import axios from "axios";

const API_BASE = "http://localhost:5500/api/admin";

export async function getUserCounts(token) {
  const res = await axios.get(`${API_BASE}/user-counts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getSellersProducts(token) {
  const res = await axios.get(`${API_BASE}/sellers-products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteProductAdmin(productId, token) {
  const res = await axios.delete(`${API_BASE}/delete-product`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { productId },
  });
  return res.data;
}

export async function getSalesReport(token) {
  const res = await axios.get(`${API_BASE}/sales-report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getLatestOrders(token) {
  const res = await axios.get(`${API_BASE}/latest-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
