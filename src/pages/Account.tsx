import { useEffect, useMemo, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/authApi";
import {
  getAccountData,
  updateAccountInfo,
  type AccountData,
} from "@/api/accountApi";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, Page, PageHeader } from "@/components/layout/Page";
import {
  Calendar,
  DollarSign,
  LogOut,
  Mail,
  Package,
  Pencil,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react";

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function getDisplayName(data: AccountData | null, fallbackUsername?: string) {
  const profile = data?.profile;
  const name = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || profile?.username || fallbackUsername || "User";
}

function getInitials(displayName: string) {
  const parts = displayName.split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (letters.join("") || "U").toUpperCase();
}

export function AccountPage() {
  const navigate = useNavigate();
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accountDataFetched = useRef(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAccountData();
      if (response.data) {
        setAccountData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch account data:", err);
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        clearUser();
        navigate("/login", { replace: true });
        return;
      }
      setError(
        (axiosError.response as any)?.data?.message ||
          "Failed to load account information",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (accountDataFetched.current) return;
    accountDataFetched.current = true;
    fetchAccountData();
  }, []);

  useEffect(() => {
    if (!isEditOpen) return;
    setEditError(null);
    setEditForm({
      firstName: accountData?.profile.firstName ?? "",
      lastName: accountData?.profile.lastName ?? "",
      email: accountData?.profile.email ?? "",
    });
  }, [isEditOpen, accountData]);

  const displayName = useMemo(
    () => getDisplayName(accountData, storeUser?.username),
    [accountData, storeUser?.username],
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      clearUser();
      navigate("/login", { replace: true });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      const res = await updateAccountInfo({
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        email: editForm.email || undefined,
      });
      if (res.data) {
        setUser(res.data as any);
      }
      showToast.success("Profile updated");
      setIsEditOpen(false);
      await fetchAccountData();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to update";
      setEditError(String(message));
      showToast.error(String(message));
    } finally {
      setIsSaving(false);
    }
  };

  const statsCards = useMemo(
    () => [
      {
        icon: <ShoppingCart className="w-5 h-5" />,
        label: "Total Orders",
        value: accountData?.stats.totalOrders ?? 0,
      },
      {
        icon: <DollarSign className="w-5 h-5" />,
        label: "Total Revenue",
        value: formatCurrency(accountData?.stats.totalRevenue ?? 0),
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        label: "Avg Order",
        value: formatCurrency(accountData?.stats.averageOrderValue ?? 0),
      },
      {
        icon: <Package className="w-5 h-5" />,
        label: "Products Sold",
        value: accountData?.stats.totalProductsSold ?? 0,
      },
    ],
    [accountData],
  );

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
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="gap-4 overflow-y-auto">
      <PageHeader
        title="Account"
        subtitle="Manage your profile and view recent activity."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="w-4 h-4" /> Edit Info
            </Button>
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
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
                {accountData?.profile.role?.name || "User"}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              Member since {formatDate(accountData?.profile.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              Last login {formatDate(accountData?.profile.lastLogin)}
            </div>
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Username</div>
                <div className="text-sm text-gray-900 truncate">
                  {accountData?.profile.username}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm text-gray-900 truncate">
                  {accountData?.profile.email}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Status</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500">Account</div>
              <div className="text-sm font-medium text-gray-900">
                {accountData?.profile.isActive ? "Active" : "Inactive"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500">Updated</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(accountData?.profile.updatedAt)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500">ID</div>
              <div className="text-xs font-medium text-gray-900 truncate">
                {accountData?.profile.id}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Account Info"
        icon={<Pencil className="w-5 h-5" />}
        maxWidth="max-w-xl"
      >
        <div className="p-4 space-y-4">
          {editError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {editError}
            </div>
          ) : null}

          <Input
            id="firstName"
            label="First name"
            value={editForm.firstName}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="First name"
          />
          <Input
            id="lastName"
            label="Last name"
            value={editForm.lastName}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Last name"
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="you@example.com"
          />

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

export default AccountPage;
