const API_BASE = "http://localhost:5500/api/product";

const getToken = () => localStorage.getItem("token");

export async function fetchTopRatedProducts() {
  try {
    const res = await fetch(`${API_BASE}/top-rated`);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Error fetching top-rated products:", err);
    return [];
  }
}


// Tüm ürünleri getir (isteğe bağlı kategori filtresiyle)
export async function fetchAllProducts(category = "") {
  try {
    const url = category ? `${API_BASE}?category=${category}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

// Belirli bir ürünün rating'ini getir
export async function fetchProductRating(productId) {
  try {
    const res = await fetch(`${API_BASE}/product/${productId}/rating`);
    if (!res.ok) throw new Error("Failed to fetch rating");
    const data = await res.json();
    return {
      average: data.average,
      count: data.count,
    };
  } catch (err) {
    console.error("Error fetching product rating:", err);
    return {
      average: 0,
      count: 0,
    };
  }
}


export async function fetchProductById(productId) {
  const res = await fetch(`${API_BASE}/product/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return await res.json();
}

export async function submitRating(productId, score) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, score }),
  });
  if (!res.ok) throw new Error("Rating failed");
  return await res.json();
}

export async function fetchUserRating(productId) {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API_BASE}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.rating;
}


export async function fetchSellerProducts(token) {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return await res.json(); // { products: [...] }
}


export async function deleteProduct(productId, token) {
  const res = await fetch(`${API_BASE}/delete/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return await res.json(); // { message: 'Product deleted successfully' }
}

export async function updateProduct(id, updatedData) {
  const res = await fetch(`${API_BASE}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updatedData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Update failed");
  return data;
}


export async function addProduct(formData, token) {
  const res = await fetch(`${API_BASE}/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NOT: FormData kullanıldığı için Content-Type otomatik ayarlanır, burada yazmaya gerek yok
    },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to add product");
  }
  return res.json();
}