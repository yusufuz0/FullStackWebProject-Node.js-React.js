import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Notification from "../components/Notification";
import {
  fetchSellerProducts,
  deleteProduct,
  addProduct,
} from "../services/productService";
import { createStripeLink } from "../services/stripeService";
import { checkStripeStatus } from "../services/authService";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    file: null,
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (token && userId) {
      loadProducts();
      loadStripeStatus();
    }
  }, [token, userId]);

  const loadProducts = async () => {
    try {
      const data = await fetchSellerProducts(token);
      setProducts(data.products || []);
    } catch (err) {
      setNotification({ message: "Failed to load products", type: "error" });
    }
  };

  const loadStripeStatus = async () => {
    try {
      const data = await checkStripeStatus(userId);
      setStripeConnected(!!data.user?.stripeAccountId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const data = await deleteProduct(productToDelete, token);
      setNotification({ message: data.message || "Product deleted.", type: "success" });
      loadProducts();
    } catch (err) {
      setNotification({ message: "Failed to delete product", type: "error" });
    } finally {
      setIsConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setNewProduct((prev) => ({ ...prev, file: files[0] }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { title, description, category, price, file } = newProduct;
    if (!title || !description || !category || !price || !file) {
      setNotification({ message: "Please fill all fields and select a file.", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const data = await addProduct(formData, token);
      setNotification({ message: data.message || "Product added successfully!", type: "success" });
      setNewProduct({ title: "", description: "", category: "", price: "", file: null });
      setShowAddForm(false);
      loadProducts();
    } catch (err) {
      setNotification({ message: err.message || "Failed to add product", type: "error" });
    }
  };

  const handleStripeSetup = async () => {
    try {
      const data = await createStripeLink(userId);
      if (data.url) {
        window.location.href = data.url;
      } else {
        setNotification({ message: data.message || "Failed to create Stripe link.", type: "error" });
      }
    } catch (err) {
      setNotification({ message: "Stripe link creation failed.", type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 px-4 sm:px-8">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "success" })}
        />
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Products</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-600">No products available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Price: £{Number(product.price).toFixed(2)}</p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                    className="flex-1 bg-indigo-100 text-indigo-700 font-semibold rounded-md py-2 hover:bg-indigo-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product.id)}
                    className="flex-1 bg-red-100 text-red-600 font-semibold rounded-md py-2 hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        {!stripeConnected && (
          <button
            onClick={handleStripeSetup}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Complete Stripe Setup
          </button>
        )}
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showAddForm ? "Cancel Add Product" : "Add New Product"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddProduct}
          className="mb-6 p-4 border rounded bg-gray-50"
          encType="multipart/form-data"
        >
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

          <div className="mb-4">
            <label htmlFor="title" className="block font-semibold mb-1">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={newProduct.title}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block font-semibold mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block font-semibold mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select Category</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="computer-science">Computer Science</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block font-semibold mb-1">Price (£)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={newProduct.price}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="file" className="block font-semibold mb-1">Upload File</label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.zip"
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Product
          </button>
        </form>
      )}

      <ConfirmModal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this product?"
      />
    </div>
  );
}