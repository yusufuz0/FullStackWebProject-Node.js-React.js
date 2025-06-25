import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./guards/ProtectedRoutes";

// Sayfalar
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Success from "./pages/Success";
import ViewProduct from "./pages/ViewProduct";
import StripeSuccess from "./pages/StripeSuccess";
import StripeRefresh from "./pages/StripeRefresh";
import EditProduct from "./pages/EditProduct";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Only Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/success"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Success />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute allowedRoles={["customer", "seller", "admin"]}>
              <ViewProduct />
            </ProtectedRoute>
          }
        />

        {/* Seller Only Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stripe-success"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <StripeSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stripe-refresh"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <StripeRefresh />
            </ProtectedRoute>
          }
        />


        {/* Admin Only Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
