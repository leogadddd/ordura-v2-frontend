import React, { lazy } from "react";
import { makePermission } from "@/lib/permission/permissions";
import {
  Apple,
  Banknote,
  HardHat,
  HomeIcon,
  MonitorIcon,
  PackageIcon,
  SettingsIcon,
  Users,
  MapPin,
} from "lucide-react";

interface NavItem {
  hidden?: boolean;
  label: string;
  to?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  permission?: string;
  /** Optional grouping label for this item. When set, Sidebar will render items grouped by section. */
  section?: string;
  children?: NavItem[];
  component?: React.ComponentType<any>;
}

interface NavigationItems {
  essentials: NavItem[];
  top: NavItem[];
  bottom: NavItem[];
}

const navigationItems = () => {
  const essentials: NavItem[] = [
    {
      label: "Login",
      to: "/login",
      component: lazy(() => import("./pages/Login")),
    },
    {
      label: "Register",
      to: "/register",
      component: lazy(() => import("./pages/Register")),
    },
  ];

  // We need to include the essential items in the navigation config so they can be
  // rendered by the router, but they won't actually be shown in the sidebar because
  // they don't have icons or permissions. The sidebar only renders items that have
  // an icon and that the user has permission to see, so these will be effectively
  // hidden from the sidebar while still being accessible routes in the app.

  const top: NavItem[] = [
    // NAVIGATION
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: HomeIcon,
      section: "Navigation",
      component: lazy(() => import("./pages/Dashboard")),
    },
    {
      label: "Point Of Sale",
      to: "/pos",
      icon: MonitorIcon,
      permission: makePermission("POS", "VIEW"),
      section: "Navigation",
      component: lazy(() => import("./pages/POS")),
    },
    {
      label: "Products",
      to: "/products",
      icon: Apple,
      permission: makePermission("PRODUCTS", "MANAGE"),
      section: "Navigation",
      component: lazy(() => import("./pages/products")),
    },
    {
      label: "Suppliers",
      to: "/suppliers",
      icon: Users,
      permission: makePermission("PRODUCTS", "MANAGE"),
      section: "Inventory",
      component: lazy(() => import("./pages/suppliers")),
    },
    {
      label: "Inventory",
      to: "/inventory",
      icon: PackageIcon,
      permission: makePermission("INVENTORY", "VIEW"),
      section: "Inventory",
      component: lazy(() => import("./pages/inventory/InventoryDashboardPage")),
    },
    {
      label: "Stocks",
      to: "/stocks",
      icon: PackageIcon,
      permission: makePermission("INVENTORY", "VIEW"),
      section: "Inventory",
      component: lazy(() => import("./pages/inventory/StocksPage")),
    },
    {
      label: "Locations",
      to: "/locations",
      icon: MapPin,
      permission: makePermission("INVENTORY", "VIEW"),
      section: "Inventory",
      component: lazy(() => import("./pages/inventory/LocationsPage")),
    },
    // {
    //   label: "Orders",
    //   to: "/orders",
    //   icon: ScrollIcon,
    //   permission: makePermission("ORDERS", "VIEW"),
    //   section: "Navigation",
    //   component: lazy(() => import("./pages/orders")),
    // },
    {
      label: "Transactions",
      to: "/transactions",
      icon: Banknote,
      permission: makePermission("TRANSACTIONS", "VIEW"),
      section: "Navigation",
      children: [
        {
          label: "Sales Transaction",
          to: "sales",
          icon: PackageIcon,
          component: lazy(
            () => import("./pages/transactions/salesTransactions"),
          ),
        },
        {
          label: "Cash Transaction",
          to: "cash",
          icon: Banknote,
          component: lazy(
            () => import("./pages/transactions/cashTransactions"),
          ),
        },
      ],
    },
    {
      label: "Users",
      to: "/users",
      icon: Users,
      permission: makePermission("USERS", "MANAGE"),
      section: "User Management",
      component: lazy(() => import("./pages/users")),
    },
    {
      label: "Roles",
      to: "/roles",
      icon: HardHat,
      permission: makePermission("ROLES", "MANAGE"),
      section: "User Management",
      component: lazy(() => import("./pages/roles")),
    },
  ];

  const bottom: NavItem[] = [
    {
      label: "Settings",
      to: "/settings",
      icon: SettingsIcon,
      permission: makePermission("SETTINGS", "VIEW"),
      component: lazy(() => import("./pages/Settings")),
    },
    {
      label: "Account",
      to: "/account",
      icon: Users,
      permission: makePermission("ACCOUNT", "VIEW"),
      component: lazy(() => import("./pages/Account")),
    },
  ];

  return { essentials, top, bottom } as NavigationItems;
};

// Export the function call result directly
export const routes = navigationItems();
