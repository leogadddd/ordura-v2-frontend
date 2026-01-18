import { makePermission } from "@/lib/permission/permissions";
import {
  Apple,
  HardHat,
  HomeIcon,
  MonitorIcon,
  PackageIcon,
  ScrollIcon,
  SettingsIcon,
  Users,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  permission?: string;
  /** Optional grouping label for this item. When set, Sidebar will render items grouped by section. */
  section?: string;
}

interface NavigationItems {
  top: NavItem[];
  bottom: NavItem[];
}

const navigationItems = () => {
  const top: NavItem[] = [
    // NAVIGATION
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: HomeIcon,
      section: "Navigation",
    },
    {
      label: "Point Of Sale",
      to: "/pos",
      icon: MonitorIcon,
      permission: makePermission("POS", "VIEW"),
      section: "Navigation",
    },
    {
      label: "Products",
      to: "/products",
      icon: Apple,
      permission: makePermission("PRODUCTS", "MANAGE"),
      section: "Navigation",
    },
    {
      label: "Orders",
      to: "/orders",
      icon: ScrollIcon,
      permission: makePermission("ORDERS", "VIEW"),
      section: "Navigation",
    },
    // USER MANAGEMENT
    {
      label: "Users",
      to: "/users",
      icon: Users,
      permission: makePermission("USERS", "MANAGE"),
      section: "User Management",
    },
    {
      label: "Roles",
      to: "/roles",
      icon: HardHat,
      permission: makePermission("ROLES", "MANAGE"),
      section: "User Management",
    },
  ];

  const bottom: NavItem[] = [
    {
      label: "Settings",
      to: "/settings",
      icon: SettingsIcon,
      permission: makePermission("SETTINGS", "VIEW"),
    },
  ];

  return { top, bottom } as NavigationItems;
};

// Export the function call result directly
export const items = navigationItems();
