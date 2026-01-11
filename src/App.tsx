import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import POSPage from "./pages/POS";
import ProductsPage from "./pages/products";
import OrdersPage from "./pages/orders";
import SettingsPage from "./pages/Settings";
import AccountPage from "./pages/Account";
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
      <Route
        path="/orders"
        element={
          <AppLayout>
            <OrdersPage />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        }
      />
      <Route
        path="/account"
        element={
          <AppLayout>
            <AccountPage />
          </AppLayout>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
