import { useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import POSPage from "./pages/POS";
import ProductsPage from "./pages/products";
import OrdersPage from "./pages/orders";
import RolesPage from "./pages/roles";
import SettingsPage from "./pages/Settings";
import AccountPage from "./pages/Account";
import UsersPage from "./pages/users";
import AppLayout from "./layouts/AppLayout";
import { useAuthStore } from "./store/authStore";
import { getCurrentUser, checkInitStatus } from "./api/authApi";

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const currentUser = useAuthStore((state) => state.user);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const initChecked = useRef(false);

  useEffect(() => {
    // Check initialization status on app start
    // Prevent duplicate calls in React StrictMode
    if (initChecked.current) return;
    initChecked.current = true;

    const checkInit = async () => {
      try {
        const initStatus = await checkInitStatus();
        setHasAdmin(initStatus.data?.hasAdmin ?? true);
      } catch (error) {
        console.error("Failed to check init status:", error);
        // Default to having admin if check fails
        setHasAdmin(true);
      } finally {
        setInitLoading(false);
      }
    };

    checkInit();
  }, []);

  // If we're in initial setup but a user was just created (e.g. finished
  // registration), update hasAdmin so the app switches to the normal flow
  // without requiring a full page reload. This effect must be declared
  // before the early return for `!hasAdmin`, otherwise TypeScript will
  // narrow `hasAdmin` to `true` and the comparison below becomes invalid.
  useEffect(() => {
    if (currentUser && hasAdmin === false) {
      setHasAdmin(true);
    }
  }, [currentUser, hasAdmin]);

  const userFetched = useRef(false);

  useEffect(() => {
    // Fetch current user on mount (only when admin exists)
    // Prevent duplicate calls in React StrictMode
    if (userFetched.current || initLoading || !hasAdmin) {
      return;
    }
    userFetched.current = true;

    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // If fetching user fails, clear user
        clearUser();
      }
    };

    fetchUser();
  }, [hasAdmin, initLoading, setUser, clearUser]);

  // Show loading while checking initialization
  if (initLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // If no admin exists, only show register page
  if (!hasAdmin) {
    return (
      <Routes>
        <Route
          path="/register"
          element={<RegisterPage isInitialSetup={true} />}
        />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    );
  }

  // If we're in initial setup but a user was just created (e.g. finished
  // registration), update hasAdmin so the app switches to the normal flow
  // without requiring a full page reload.
  // Note: only do this when hasAdmin is explicitly false to avoid
  // interfering with initial check flow.

  // Normal app flow when admin exists
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/register"
        element={<RegisterPage isInitialSetup={false} />}
      />
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
        path="/users"
        element={
          <AppLayout>
            <UsersPage />
          </AppLayout>
        }
      />
      <Route
        path="/roles"
        element={
          <AppLayout>
            <RolesPage />
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
