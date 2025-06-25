import React, { useEffect, useState, useCallback } from "react";
import {
  fetchCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/cartService";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../contexts/CartContext";
import { createCheckoutSession } from "../services/stripeService";

const stripePromise = loadStripe(
  "pk_test_51QyYGzD8YljAw1frUBVTX5tqu8ZgwOF6QS5TQkRzCBbCkNvCJ0pxE8ynEgYRHrfySNEgcI6SbPVjfnkiXNszPdx8005IONkxhJ"
);

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState({ text: "", color: "green" });

  const token = localStorage.getItem("token");
  const { loadCartCount } = useCart();

  const showMessage = (text, color = "green") => {
    setMessage({ text, color });
    setTimeout(() => setMessage({ text: "", color: "green" }), 2000);
  };

  const loadCart = useCallback(async () => {
    try {
      const data = await fetchCartItems();
      setCartItems(data.items || []);
    } catch (error) {
      showMessage("Failed to load cart items", "red");
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadCart();
    }
  }, [loadCart, token]);

  const handleRemove = async (productId) => {
    try {
      await removeCartItem(productId);
      showMessage("Item removed from cart");
      loadCartCount(); // cart'ı güncelle
      loadCart();
    } catch {
      showMessage("Failed to remove item", "red");
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    try {
      await updateCartItemQuantity(productId, parseInt(quantity));
      loadCartCount(); // cart'ı güncelle
      loadCart();
    } catch {
      showMessage("Failed to update quantity", "red");
    }
  };

const handleCheckout = async () => {
  try {
    const data = await createCheckoutSession(token);
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: data.id });
  } catch (err) {
    showMessage("Payment process failed", "red");
    console.error(err);
  }
};


const total = cartItems
    .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    .toFixed(2);

  if (!token) {
    return (
      <p className="text-center mt-8">
        Please login to view your cart.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 mt-24">
      {message.text && (
        <div className={`text-center mb-4 text-${message.color}-600 font-medium`}>
          {message.text}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="border rounded p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">
                  £{Number(item.price).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleQuantityChange(item.productId, e.target.value)
                  }
                  className="w-16 px-2 py-1 border rounded"
                />
                
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-between items-center">
            <p className="text-lg font-semibold">Total: £{total}</p>
            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
