import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import {
  User,
  Mail,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logout } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { AccountData, getAccountData } from "@/api/accountApi";

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

export function AccountPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accountDataFetched = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (accountDataFetched.current) return;
    accountDataFetched.current = true;

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const response = await getAccountData();
        if (response.data) {
          setAccountData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch account data:", err);
        const error = err as AxiosError;
        if (error.response?.status === 401) {
          clearUser();
          navigate("/login", { replace: true });
          return;
        }
        setError(
          (error.response as any)?.data?.message ||
            "Failed to load account information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [clearUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      label: "Total Orders",
      value: accountData?.stats.totalOrders || 0,
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "Total Revenue",
      value: formatCurrency(accountData?.stats.totalRevenue || 0),
      color: "bg-green-50 border-green-200",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Average Order Value",
      value: formatCurrency(accountData?.stats.averageOrderValue || 0),
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: "Products Sold",
      value: accountData?.stats.totalProductsSold || 0,
      color: "bg-orange-50 border-orange-200",
    },
  ];

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Account</h1>
          <p className="text-gray-600">
            Manage your profile and view analytics.
          </p>
        </div>
        <Button onClick={handleLogout} variant="secondary" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-linear-to-r from-primary to-primary-dark rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
              {getUserInitials()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{getUserDisplayName()}</h2>
              <p className="text-white/80 capitalize text-sm">
                {user?.roleDetails?.name || "User"}
              </p>
              <p className="text-white/70 text-sm mt-1">{user?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Member since</p>
              <p className="font-semibold">
                {accountData?.user.createdAt
                  ? formatDate(accountData.user.createdAt)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} border rounded-lg p-6 transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="text-gray-400">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Username
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Role
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                      {user?.roleDetails?.name || "User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Account Created
                </span>
                <span className="font-medium text-gray-900">
                  {accountData?.user.createdAt
                    ? formatDate(accountData.user.createdAt)
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Total Orders
                </span>
                <span className="font-medium text-gray-900">
                  {accountData?.stats.totalOrders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Completed Orders
                </span>
                <span className="font-medium text-gray-900">
                  {accountData?.stats.completedOrders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Last Login
                </span>
                <span className="font-medium text-gray-900">
                  {accountData?.user.lastLogin
                    ? formatDate(accountData.user.lastLogin)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="font-semibold text-gray-900">
                  {accountData?.user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">
                  {accountData?.user.updatedAt
                    ? formatDate(accountData.user.updatedAt)
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Account ID</p>
                <p className="font-semibold text-gray-900 text-xs truncate">
                  {accountData?.user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
