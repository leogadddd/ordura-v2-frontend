import { useEffect, useMemo, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/authApi";
import { getAccountData, type AccountData } from "@/api/accountApi";
import { Card, Page, PageHeader } from "@/components/layout/Page";
import {
  ArrowPathIcon,
  BoltIcon,
  CubeIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDisplayName(accountData: AccountData | null, fallback?: string) {
  const p = accountData?.profile;
  const name = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
  return name || p?.username || fallback || "User";
}

function getInitials(displayName: string) {
  const parts = displayName.split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (letters.join("") || "U").toUpperCase();
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetched = useRef(false);

  const fetchSummary = async () => {
    try {
      setError(null);
      const res = await getAccountData();
      if (res.data) setAccountData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        clearUser();
        navigate("/login", { replace: true });
        return;
      }
      setError(
        (axiosError.response as any)?.data?.message ||
          "Failed to load dashboard",
      );
    }
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    (async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    })();
    // intentionally once
  }, []);

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

  const displayName = useMemo(
    () => getDisplayName(accountData, user?.username),
    [accountData, user?.username],
  );

  const statsCards = useMemo(
    () => [
      {
        icon: <ReceiptPercentIcon className="w-5 h-5" />,
        label: "Total Revenue",
        value: formatCurrency(accountData?.stats.totalRevenue ?? 0),
      },
      {
        icon: <BoltIcon className="w-5 h-5" />,
        label: "Total Orders",
        value: accountData?.stats.totalOrders ?? 0,
      },
      {
        icon: <BoltIcon className="w-5 h-5" />,
        label: "Completed",
        value: accountData?.stats.completedOrders ?? 0,
      },
      {
        icon: <CubeIcon className="w-5 h-5" />,
        label: "Products Sold",
        value: accountData?.stats.totalProductsSold ?? 0,
      },
    ],
    [accountData],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSummary();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <Page className="gap-4 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-36 bg-gray-200 rounded-2xl" />
            <div className="h-36 bg-gray-200 rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="gap-6 overflow-y-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Today’s view across sales and activity."
        actions={
          <>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {accountData?.profile.role?.name || user?.roleDetails?.name || "User"}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
              disabled={isRefreshing}
              title="Refresh dashboard"
            >
              <ArrowPathIcon
                className="w-4 h-4"
                style={{
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                }}
              />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="secondary" size="sm">
              Logout
            </Button>
          </>
        }
      />

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4 text-red-700 text-sm">{error}</div>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="mt-2 text-xl font-semibold text-gray-900 truncate">
                  {s.value}
                </p>
              </div>
              <div className="text-gray-400 shrink-0">{s.icon}</div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center text-primary font-semibold">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 truncate">
                {displayName}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {accountData?.profile.email}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Member since {formatDate(accountData?.profile.createdAt)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="primary"
              size="md"
              className="whitespace-nowrap"
              onClick={() => navigate("/pos")}
            >
              New Sale
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="whitespace-nowrap"
              onClick={() => navigate("/orders")}
            >
              View Orders
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="whitespace-nowrap"
              onClick={() => navigate("/products")}
            >
              Products
            </Button>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Sales
            </h2>
            <span className="text-xs text-gray-500">
              Showing last {accountData?.recentSales.length ?? 0}
            </span>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
            <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <div className="col-span-5">Order</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Items</div>
            </div>
            <div className="divide-y divide-gray-200">
              {accountData?.recentSales.length ? (
                accountData.recentSales.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-12 px-3 py-2 text-sm"
                  >
                    <div className="col-span-5 text-gray-900 truncate">
                      {s.id}
                      <div className="text-xs text-gray-500">
                        {formatDate(s.createdAt)}
                      </div>
                    </div>
                    <div className="col-span-3 text-gray-700 truncate">
                      {s.status}
                    </div>
                    <div className="col-span-2 text-right text-gray-900">
                      {formatCurrency(s.grandTotal)}
                    </div>
                    <div className="col-span-2 text-right text-gray-700">
                      {s.itemsQuantity}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-gray-500 text-center">
                  No sales yet.
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>
    </Page>
  );
}

export default DashboardPage;
