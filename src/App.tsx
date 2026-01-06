import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./routes/Login";
import RegisterPage from "./routes/Register";
import DashboardPage from "./routes/Dashboard";
import POSPage from "./routes/POS";
import ProductsPage from "./routes/products";
import AppLayout from "./layouts/AppLayout";
import { useAuthStore } from "./store/authStore";
import { getCurrentUser } from "./api/authApi";

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const location = useLocation();

  useEffect(() => {
    // Fetch current user on mount and when navigating to protected routes
    const fetchUser = async () => {
      // Skip if on public routes
      if (location.pathname === "/login" || location.pathname === "/register") {
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // If fetching user fails, clear user and they'll be redirected
        clearUser();
      }
    };

    fetchUser();
  }, [location.pathname, setUser, clearUser]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/pos"
        element={
          <AppLayout>
            <POSPage />
          </AppLayout>
        }
      />
      <Route
        path="/products"
        element={
          <AppLayout>
            <ProductsPage />
          </AppLayout>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
