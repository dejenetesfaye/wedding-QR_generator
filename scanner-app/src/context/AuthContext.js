import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../config";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Simple expiry check
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Set user state and default axios header
          const userData = JSON.parse(localStorage.getItem("user"));
          setUser(userData);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { username, password });

      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
