import React, { useEffect, useState } from "react";
import { fetchSellerSales } from "../services/stripeService";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await fetchSellerSales(token);
        setSales(data.sales);
        setRevenue(data.totalRevenue);
      } catch (err) {
        setError("Failed to load sales.");
        console.error(err);
      }
    };

    if (token) loadSales();
  }, [token]);

  if (!token) {
    return (
      <p className="mt-24 text-center text-lg font-medium text-red-600">
        Please login to view your sales.
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-24 text-center text-red-500 text-lg font-medium">{error}</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-24 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-5 tracking-tight">
        My Sales
      </h2>
      <p className="text-xl font-semibold mb-8 text-gray-800">
        Total Revenue:{" "}
        <span className="text-green-600 font-bold">£{revenue.toFixed(2)}</span>
      </p>

      {sales.length === 0 ? (
        <p className="text-center text-gray-500 text-base italic">No sales found.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-200 hover:shadow-md transition-shadow duration-300"
            >
              <p className="font-semibold text-lg text-indigo-900 mb-1 truncate">
                {sale.productTitle}
              </p>
              <div className="text-gray-700 space-y-0.5 text-sm">
                <p>
                  <span className="font-medium">Quantity Sold:</span> {sale.quantitySold}
                </p>
                <p>
                  <span className="font-medium">Unit Price:</span>{" "}
                  <span className="text-green-700">£{Number(sale.price).toFixed(2)}</span>
                </p>
                <p>
                  <span className="font-medium">Total:</span>{" "}
                  <span className="text-green-800 font-semibold">
                    £{(sale.price * sale.quantitySold).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
