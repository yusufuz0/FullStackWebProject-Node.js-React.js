const API_BASE = "http://localhost:5500/api/cart";

const token = () => localStorage.getItem("token");


export async function addToCart(productData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Cart add failed");
  return await res.json();
}



export const fetchCartItems = async () => {
  const res = await fetch(`${API_BASE}/`, {
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });
  return await res.json();
};


export const removeCartItem = async (productId) => {
  const res = await fetch(`${API_BASE}/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId }),
  });
  return await res.json();
};



export const updateCartItemQuantity = async (productId, quantity) => {
  const res = await fetch(`${API_BASE}/update/quantity`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return await res.json();
};
