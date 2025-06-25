import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    userType: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-pink-100 to-red-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl ring-1 ring-purple-300">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700">
          Create an Account
        </h2>

        {error && (
          <div className="mb-6 text-red-700 font-semibold bg-red-100 border border-red-300 p-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full border border-purple-300 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="w-full border border-purple-300 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="********"
              className="w-full border border-purple-300 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">User Type</label>
            <select
              name="userType"
              value={form.userType}
              onChange={handleChange}
              className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 shadow-sm"
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-400"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}
