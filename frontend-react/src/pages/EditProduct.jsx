import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, updateProduct } from "../services/productService";
import Notification from "../components/Notification";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchProductById(id)
      .then((data) =>
        setProduct({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price || "",
        })
      )
      .catch(() =>
        setNotification({ message: "Failed to load product.", type: "error" })
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: "", type: "success" });

    if (!product.title || !product.price) {
      setNotification({ message: "Title and Price are required.", type: "error" });
      return;
    }

    try {
      const data = await updateProduct(id, product);
      setNotification({ message: data.message || "Product updated successfully.", type: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setNotification({ message: err.message || "Update failed.", type: "error" });
    }
  };

  if (loading) return <p className="mt-24 text-center">Loading product...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-24 p-6 bg-white shadow-lg rounded-xl border border-gray-200 relative">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "success" })}
        />
      )}

      <h2 className="text-3xl font-extrabold text-blue-700 mb-6">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block font-semibold text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={product.title}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="category" className="block font-semibold text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Category</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="computer-science">Computer Science</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block font-semibold text-gray-700 mb-1">
            Price (£) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={product.price}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}
