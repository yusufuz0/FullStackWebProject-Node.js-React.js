import React, { useState } from "react";
import { login } from "../services/authService";
import Button from "../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-pink-100 to-red-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl ring-1 ring-purple-300">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700">
          Login to Your Account
        </h2>

        {error && (
          <div className="mb-6 text-red-700 font-semibold bg-red-100 border border-red-300 p-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-800 font-semibold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-purple-300 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 shadow-sm"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-800 font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-purple-300 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 shadow-sm"
              placeholder="********"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-400"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
