// src/pages/Purchases.jsx

import React, { useEffect, useState } from "react";
import { fetchPurchases } from "../services/stripeService";
import { Link } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("You must be logged in to view your purchases.");
      setLoading(false);
      return;
    }

    const loadPurchases = async () => {
      try {
        const data = await fetchPurchases(token);
        setPurchases(data);
      } catch (err) {
        setError("Failed to load purchases.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [token]);

  if (loading) return <p className="mt-24 text-center">Loading...</p>;
  if (error) return <p className="mt-24 text-center text-red-500">{error}</p>;

return (
  <div className="max-w-3xl mx-auto px-4 py-6 mt-20">
    <h2 className="text-2xl font-bold mb-6 text-blue-700">🎉 Your Purchases</h2>

    {purchases.length === 0 ? (
      <p className="text-gray-600 text-center">You have not purchased anything yet.</p>
    ) : (
      <div className="space-y-4 space-x-4">
        {purchases.map((item, index) => (
          <Link to={`/product/${item.productId}`} key={index}>
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-l-4 border-purple-400 p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition-transform duration-200">
              <p className="text-lg font-semibold text-gray-800">{item.title}</p>
              <p className="inline-block bg-blue-600 text-white text-xs px-2 py-1 mt-2 rounded-full">
                £{Number(item.price).toFixed(2)}
              </p>
              <div className="flex items-center text-gray-600 text-sm mt-2 gap-2">
                <FaCalendarAlt className="text-blue-500" />
                <span>{new Date(item.purchasedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

}
