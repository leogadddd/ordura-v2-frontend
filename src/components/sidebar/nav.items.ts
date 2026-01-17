import { makePermission } from "@/lib/permission/permissions";
import {
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
      permission: makePermission("POS", "VIEW"),
    },
    {
      label: "Products",
      to: "/products",
      icon: PackageIcon,
      permission: makePermission("PRODUCTS", "MANAGE"),
    },
    {
      label: "Orders",
      to: "/orders",
      icon: ScrollIcon,
      permission: makePermission("ORDERS", "VIEW"),
    },
  ];

  const bottom: NavItem[] = [
    {
      label: "Users",
      to: "/users",
      icon: Users,
      permission: makePermission("USERS", "MANAGE"),
    },
    {
      label: "Roles",
      to: "/roles",
      icon: HardHat,
      permission: makePermission("ROLES", "MANAGE"),
    },
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
