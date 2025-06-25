import React, { useEffect, useState } from "react";
import {
  getUserCounts,
  getSalesReport,
  getLatestOrders,
  getSellersProducts,
  deleteProductAdmin,
} from "../services/adminService";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Notification from "../components/Notification";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [userCounts, setUserCounts] = useState({ customers: 0, sellers: 0 });
  const [salesReport, setSalesReport] = useState({});
  const [latestOrders, setLatestOrders] = useState([]);
  const [sellersProducts, setSellersProducts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSellerId, setSelectedSellerId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, reportRes, ordersRes, productsRes] = await Promise.all([
          getUserCounts(token),
          getSalesReport(token),
          getLatestOrders(token),
          getSellersProducts(token),
        ]);
        setUserCounts(usersRes);
        setSalesReport(reportRes);
        setLatestOrders(ordersRes);
        setSellersProducts(productsRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    fetchData();
  }, [token]);

  const sellerData = Object.entries(salesReport || {});
  const totalGross = sellerData.reduce((sum, [, s]) => sum + (s.totalEarned || 0), 0);
  const totalPlatform = totalGross * 0.2;

  const productQuantities = {};
  sellerData.forEach(([, seller]) => {
    Object.values(seller.products || {}).forEach((p) => {
      if (!productQuantities[p.title]) productQuantities[p.title] = 0;
      productQuantities[p.title] += p.quantity || 0;
    });
  });

  const topProductNames = Object.entries(productQuantities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topSellers = sellerData
    .sort((a, b) => (b[1].totalEarned || 0) - (a[1].totalEarned || 0))
    .slice(0, 5);

  return (
    <div className="p-6 sm:p-8 mt-24 max-w-7xl mx-auto space-y-10 bg-gradient-to-b from-blue-50 to-white min-h-screen rounded-xl">
      <h1 className="text-4xl font-extrabold text-blue-900">Admin Dashboard</h1>

      {/* USER SUMMARY */}
      <div className="bg-white rounded-2xl shadow-lg p-6 transition hover:shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">User Summary</h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3 text-lg text-gray-700">
            <p>👤 Total Customers: <strong>{userCounts.customers}</strong></p>
            <p>🛍️ Total Sellers: <strong>{userCounts.sellers}</strong></p>
          </div>
          <div className="w-full md:w-72 h-72">
            <Pie
              data={{
                labels: ["Customers", "Sellers"],
                datasets: [
                  {
                    data: [userCounts.customers, userCounts.sellers],
                    backgroundColor: ["#36A2EB", "#FF6384"],
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* SALES REPORT */}
<div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-blue-100">
  <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2 mb-8">
    📈 Sales Report
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Top Products */}
    <div className="rounded-xl p-5 border border-blue-100 shadow-inner bg-white/80 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
        🏆 Top 5 Best Selling Products
      </h3>
      <Bar
        data={{
          labels: topProductNames.map(([name]) => name),
          datasets: [
            {
              label: "Quantity Sold",
              data: topProductNames.map(([, val]) => val),
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
              borderRadius: 8,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#f1f5f9",
              titleColor: "#0f172a",
              bodyColor: "#1e293b",
              borderColor: "#3b82f6",
              borderWidth: 1,
            },
          },
        }}
      />
    </div>

    {/* Top Sellers */}
    <div className="rounded-xl p-5 border border-yellow-100 shadow-inner bg-white/80 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
        💼 Top 5 Earning Sellers
      </h3>
      <Bar
        data={{
          labels: topSellers.map(([, s]) => s.email),
          datasets: [
            {
              label: "Gross Earned (£)",
              data: topSellers.map(([, s]) => s.totalEarned),
              backgroundColor: "rgba(234, 179, 8, 0.7)",
              borderColor: "rgba(202, 138, 4, 1)",
              borderWidth: 1,
              borderRadius: 8,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fefce8",
              titleColor: "#78350f",
              bodyColor: "#92400e",
              borderColor: "#eab308",
              borderWidth: 1,
            },
          },
        }}
      />
    </div>
  </div>

  {/* Seller Breakdown */}
  <div className="mt-10 space-y-6 text-sm text-gray-800">
    {sellerData.map(([id, s]) => (
      <div key={id} className="border-t pt-4 pb-2">
        <h3 className="font-bold text-blue-900">👤 Seller: {s.email}</h3>
        <p>💰 Gross: £{s.totalEarned.toFixed(2)}</p>
        <p>📤 Net to Seller: £{(s.totalEarned * 0.8).toFixed(2)}</p>
        <p>🏛️ Platform Revenue: £{(s.totalEarned * 0.2).toFixed(2)}</p>
        <p>✅ Paid: £{(s.payments.paid * 0.8).toFixed(2)}</p>
        <p>⏳ Pending: £{(s.payments.pending * 0.8).toFixed(2)}</p>
        <div className="ml-4 mt-2 space-y-1">
          {Object.entries(s.products).map(([pid, p]) => (
            <p key={pid} className="text-gray-700">
              🔹 <span className="font-medium">{p.title}</span> — Qty: {p.quantity}, Total: £{p.total.toFixed(2)}
            </p>
          ))}
        </div>
      </div>
    ))}

    <div className="font-semibold border-t pt-6 text-blue-900">
      <p>📊 Total Gross Earned: £{totalGross.toFixed(2)}</p>
      <p>🏦 Total Platform Revenue: £{totalPlatform.toFixed(2)}</p>
    </div>
  </div>
</div>


      {/* LATEST ORDERS */}
      <div className="bg-white rounded-2xl shadow-lg p-6 transition hover:shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Latest 5 Purchases</h2>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white text-sm text-left border">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-3">Seller</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {latestOrders.map((o, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3">{o.sellerEmail}</td>
                  <td className="p-3">{o.buyerEmail}</td>
                  <td className="p-3">{o.productTitle}</td>
                  <td className="p-3">£{o.price.toFixed(2)}</td>
                  <td className="p-3">{new Date(o.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELLERS & PRODUCTS */}
      <div className="bg-white rounded-2xl shadow-lg p-6 transition hover:shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Sellers & Products</h2>
        {sellersProducts.map((s, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="font-bold text-blue-800 mb-2">{s.sellerEmail}</h3>
            {s.products.map((p) => (
              <div key={p.id} className="ml-4 flex justify-between items-center py-2 border-b">
                <Link to={`/product/${p.id}`} className="text-gray-700 hover:text-blue-600 transition">
                  🔗 {p.title} — £{p.price}
                </Link>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  onClick={() => {
                    setSelectedProduct(p);
                    setSelectedSellerId(s.sellerId);
                    setConfirmOpen(true);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* NOTIFICATION */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedProduct?.title}"?`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await deleteProductAdmin(selectedProduct.id, token);
            setSellersProducts((prev) =>
              prev.map((sp) =>
                sp.sellerId === selectedSellerId
                  ? { ...sp, products: sp.products.filter((pr) => pr.id !== selectedProduct.id) }
                  : sp
              )
            );
            setNotification({ message: "Product deleted successfully", type: "success" });
          } catch (err) {
            setNotification({ message: "Error deleting product", type: "error" });
          }
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
