import { makePermission } from "@/lib/permission/permissions";
import {
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
}

interface NavigationItems {
  top: NavItem[];
  bottom: NavItem[];
}

const navigationItems = () => {
  const top: NavItem[] = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Point Of Sale",
      to: "/pos",
      icon: MonitorIcon,
      permission: makePermission("POS", "view"),
    },
    {
      label: "Products",
      to: "/products",
      icon: PackageIcon,
      permission: makePermission("PRODUCTS", "manage"),
    },
    {
      label: "Users",
      to: "/users",
      icon: Users,
      permission: makePermission("USERS", "manage"),
    },
    {
      label: "Orders",
      to: "/orders",
      icon: ScrollIcon,
      permission: makePermission("ORDERS", "view"),
    },
  ];

  const bottom: NavItem[] = [
    {
      label: "Settings",
      to: "/settings",
      icon: SettingsIcon,
      permission: makePermission("SETTINGS", "view"),
    },
  ];

  return { top, bottom } as NavigationItems;
};

// Export the function call result directly
export const items = navigationItems();
