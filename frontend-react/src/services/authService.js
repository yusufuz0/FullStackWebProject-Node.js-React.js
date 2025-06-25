import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

// LOGIN
export async function login(email, password) {
  try {
    const res = await API.post("/login", { email, password });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
}

// REGISTER
export async function register({ email, password, name, userType }) {
  try {
    const res = await API.post("/register", {
      email,
      password,
      name,
      userType,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Registration failed");
  }
}


export async function checkStripeStatus(userId) {
  try {
    const res = await axios.post("/get", { userId });
    return res.data; // { user: { ... } }
  } catch (error) {
    throw new Error("Stripe status check failed");
  }
}