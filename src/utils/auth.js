import { message } from "antd";
import axios from "axios";

const isBrowser = typeof window !== "undefined"; // Cek apakah di browser

// === Konfigurasi Axios ===
export const instance = axios.create({
  baseURL: "https://mahyani.amayor.id/api", // ubah jika server lokal: http://localhost:3000/api
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// === Token Helpers ===
export const getToken = () => {
  return isBrowser ? localStorage.getItem("baznas_token") : null;
};

export const clearToken = () => {
  if (isBrowser) {
    localStorage.removeItem("baznas_token");
    localStorage.removeItem("baznas_user");
    localStorage.removeItem("baznas_typeUser");
    localStorage.removeItem("baznas_id");
    localStorage.removeItem("baznas_userData");
  }
};

// === Cek apakah sudah login ===
export const isAuthenticated = () => {
  if (isBrowser) {
    const token = localStorage.getItem("baznas_token");
    return !!token;
  }
  return false;
};

// === LOGIN ===
export const loginUser = async (email, password) => {
  try {
    message.loading("Logging in...", 1);
    const res = await instance.post("/auth/login", { email, password });

    if (res.data?.token) {
      const { token, user } = res.data;

      localStorage.setItem("baznas_token", token);
      localStorage.setItem("baznas_user", user.username);
      localStorage.setItem("baznas_userData", JSON.stringify(user));
      localStorage.setItem("baznas_typeUser", user.role);
      localStorage.setItem("baznas_id", user.id);

      message.success("Login berhasil!");
      return { success: true, user };
    } else {
      message.error("Gagal login: Token tidak ditemukan");
      return { success: false };
    }
  } catch (err) {
    console.error("Login error:", err);
    message.error(err.response?.data?.message || "Login gagal");
    return { success: false };
  }
};

// === LOGOUT ===
export const logoutUser = async () => {
  try {
    message.loading("Logging out...", 1);
    const token = getToken();

    if (token) {
      // Panggil endpoint logout backend (jika disediakan)
      await instance.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    clearToken();
    message.success("Logout berhasil");
    window.location.replace("/login");
  } catch (error) {
    console.error("Logout failed:", error.message);
    clearToken();
    window.location.replace("/login");
  }
};

// === DEAUTH LOCAL === (force logout tanpa API)
export const deauthUser = () => {
  message.loading("Please wait...", 1).then(() => {
    try {
      clearToken();
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  });
};

// === Interceptor untuk otomatis attach token ===
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// === Interceptor untuk auto redirect jika error 401 ===
let hasShownSessionExpired = false; // flag global

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      // Jika token invalid / belum login
      clearToken();

      // Tampilkan pesan hanya sekali
      if (!hasShownSessionExpired) {
        message.warning("Sesi login Anda telah berakhir. Silakan login kembali.");
        hasShownSessionExpired = true;
      }

      // Redirect ke halaman login (hindari infinite loop)
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.replace("/login");
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

