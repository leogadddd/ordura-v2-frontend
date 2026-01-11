import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/authApi";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.error("Logout error:", error);
    } finally {
      clearUser();
      navigate("/login", { replace: true });
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || "User";
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Dashboard</h1>
          <p className="text-gray-600">Quick snapshot of your POS activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "User"}
            </p>
          </div>
          <Button onClick={handleLogout} variant="secondary" size="sm">
            Logout
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-primary-pale bg-white/80 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Today's Sales</p>
          <p className="mt-2 text-2xl font-semibold text-primary">₱ 12,340</p>
          <p className="text-xs text-gray-500">+8.2% vs yesterday</p>
        </div>
        <div className="rounded-xl border border-primary-pale bg-white/80 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-primary">184</p>
          <p className="text-xs text-gray-500">+12 new since 2pm</p>
        </div>
        <div className="rounded-xl border border-primary-pale bg-white/80 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Inventory Alerts</p>
          <p className="mt-2 text-2xl font-semibold text-primary">6 items</p>
          <p className="text-xs text-gray-500">Low stock nearing threshold</p>
        </div>
      </section>

      <section className="rounded-xl border border-primary-pale bg-white/80 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          <Link
            to="/login"
            className="text-sm text-primary hover:text-primary-light font-medium"
          >
            Go to Login
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Button variant="primary" size="lg" className="shadow">
            New Sale
          </Button>
          <Button variant="secondary" size="lg">
            View Inventory
          </Button>
          <Button variant="secondary" size="lg">
            Run Report
          </Button>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
