import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Popover } from "@/components/ui/Popover";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/authApi";
import { items } from "../../routes";
import { Logo } from "@/components/ui/Logo";
import { useSidebar } from "@/context/SidebarProvider";

export function Sidebar() {
  const { isExpanded, toggleExpanded, setCurrentRoute } = useSidebar();
  // hover-based popovers used for folder-like items
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const clearUser = useAuthStore((state) => state.clearUser);
  const navigate = useNavigate();

  const filteredTopItems = items.top.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const filteredBottomItems = items.bottom.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearUser();
      navigate("/login");
    }
  };

  // Group top items by section while preserving order of sections and items
  const groupedTopItems = (() => {
    const order: (string | null)[] = [];
    const map = new Map<string | null, typeof filteredTopItems>();
    for (const item of filteredTopItems) {
      const key = item.section ?? null;
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(item);
    }
    return order.map((k) => ({ section: k, items: map.get(k)! }));
  })();

  // Generate a background color based on the user's first letter
  const getAvatarColor = (name: string | null) => {
    if (!name) return "bg-primary"; // Stable accent color when user not yet loaded
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const userInitial =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    null;
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || "User";

  return (
    <div className="hidden md:block">
      <aside
        className={`h-[calc(100vh-1.75rem)] sticky top-0 border-r border-primary-pale bg-white/90 shadow-sm flex flex-col py-2 ${
          isExpanded ? "w-48 px-1.5" : "w-14 items-center px-1.5"
        }`}
      >
        <div className="mb-1">
          <button
            onClick={toggleExpanded}
            className={`flex items-center gap-2.5 rounded-xl h-12 text-gray-600 hover:bg-primary-pale ${
              isExpanded ? "px-2 w-full" : "w-10.5 px-2 justify-center"
            }`}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <>
                <div className="flex-1 flex items-center gap-2">
                  <Logo size={26} alt="Ordura logo" showText="Ordura" />
                </div>
                <ChevronLeftIcon className="w-5 h-5 opacity-25" />
              </>
            ) : (
              // <ChevronRightIcon className="w-5 h-5 opacity-25" />
              <Logo size={28} alt="Ordura logo" />
            )}
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {/* When expanded, show section headers and grouped items. When collapsed, show a flat list so headers don't take space. */}
          {isExpanded
            ? groupedTopItems.map((group) => (
                <div key={group.section ?? "__default"}>
                  {group.section && (
                    <div className="px-3 pt-2 pb-1 text-xs text-gray-500 uppercase font-semibold tracking-wide">
                      {group.section}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      // For folder-like nav items (have children), show a hover-triggered popover anchored to the right
                      if (item.children && item.children.length > 0) {
                        return (
                          <Popover
                            key={item.label}
                            placement="right"
                            // panelClassName="py-2"
                            className="w-full"
                            trigger={() => (
                              // rely on Popover hover handling rather than manual mouse handlers
                              <div>
                                <button
                                  className={`flex items-center gap-2.5 rounded-xl h-12 px-3 w-full text-gray-600 hover:bg-primary-pale`}
                                  title={item.label}
                                >
                                  <Icon className="w-5 h-5" />
                                  <span className="text-sm font-medium">
                                    {item.label}
                                  </span>
                                  <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-400" />
                                </button>
                              </div>
                            )}
                            hover
                          >
                            {(close) => (
                              <div className="flex flex-col min-w-50 overflow-hidden">
                                {item.children!.map((child) => {
                                  const ChildIcon = child.icon;
                                  return (
                                    <NavLink
                                      key={child.to}
                                      to={child.to!}
                                      onClick={() => {
                                        close();
                                        setCurrentRoute(child.to!);
                                      }}
                                      className={({ isActive }) =>
                                        `flex items-center gap-2.5 h-12 px-4 text-sm ${
                                          isActive
                                            ? "bg-primary text-white"
                                            : "text-gray-600 hover:bg-primary-pale"
                                        }`
                                      }
                                    >
                                      <ChildIcon className="w-4 h-4" />
                                      <span className="truncate">
                                        {child.label}
                                      </span>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            )}
                          </Popover>
                        );
                      }

                      // Default single link item
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to!}
                          onClick={() => setCurrentRoute(item.to!)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-xl h-12 px-3 ${
                              isActive
                                ? "bg-primary text-white"
                                : "text-gray-600 hover:bg-primary-pale"
                            }`
                          }
                          title={!isExpanded ? item.label : undefined}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))
            : filteredTopItems.map((item) => {
                const Icon = item.icon;
                const toPath = item.to ?? item.children?.[0]?.to ?? "#";

                if (item.children && item.children.length > 0) {
                  return (
                    <Popover
                      key={item.label}
                      placement="right"
                      // panelClassName="py-2"
                      className="w-11"
                      hover
                      trigger={() => (
                        <div>
                          {item.to ? (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 rounded-xl h-12 relative${
                                  isExpanded ? "px-3" : "w-11 px-3"
                                } ${
                                  isActive
                                    ? "bg-primary text-white"
                                    : "text-gray-600 hover:bg-primary-pale"
                                }`
                              }
                              title={!isExpanded ? item.label : undefined}
                            >
                              <Icon className="w-5 h-5" />
                              <ChevronRightIcon className="w-3 h-3 absolute top-4.5 right-0" />
                            </NavLink>
                          ) : (
                            <div
                              className={`flex items-center gap-2.5 rounded-xl h-12 relative ${
                                isExpanded ? "px-3" : "w-11 px-3"
                              } text-gray-600 hover:bg-primary-pale`}
                              title={!isExpanded ? item.label : undefined}
                              aria-hidden
                            >
                              <Icon className="w-5 h-5" />
                              <ChevronRightIcon className="w-3 h-3 absolute top-4.5 right-0" />
                            </div>
                          )}
                        </div>
                      )}
                    >
                      {(close) => (
                        <div className="flex flex-col min-w-50 overflow-hidden">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <NavLink
                                key={child.to}
                                to={child.to!}
                                onClick={() => close()}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 h-12 px-4 text-sm ${
                                    isActive
                                      ? "bg-primary text-white"
                                      : "text-gray-600 hover:bg-primary-pale"
                                  }`
                                }
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span className="truncate">{child.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </Popover>
                  );
                }

                return (
                  <NavLink
                    key={toPath}
                    to={toPath}
                    onClick={() => setCurrentRoute(toPath)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl h-12 ${
                        isExpanded ? "px-3" : "w-11 px-3"
                      } ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-primary-pale"
                      }`
                    }
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    {isExpanded && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
        </nav>

        <nav className="space-y-1 mt-auto">
          {filteredBottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to!}
                to={item.to!}
                onClick={() => setCurrentRoute(item.to!)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl h-12 ${
                    isExpanded ? "px-3" : "w-11 px-3"
                  } ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-primary-pale"
                  }`
                }
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {isExpanded && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}

          {/* Profile Button with Popover */}
          <Popover
            trigger={({ toggle }) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className={`flex items-center gap-2.5 rounded-xl h-12 ${
                  isExpanded ? "px-1.25 w-full" : "w-11 px-3 justify-center"
                } text-gray-600 hover:bg-primary-pale`}
                title={!isExpanded ? "Account" : undefined}
              >
                <div
                  className={`${getAvatarColor(
                    userInitial,
                  )} w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                >
                  {userInitial ?? "U"}
                </div>
                {isExpanded && (
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium truncate">
                      {userName}
                    </span>
                    <span className="text-xs truncate font-light ">
                      {user?.roleDetails?.name || "User"}
                    </span>
                  </div>
                )}
              </button>
            )}
            align="left"
            placement="top"
            matchTriggerWidth={isExpanded}
            panelClassName=""
          >
            {(close) => (
              <div className="">
                <button
                  onClick={() => {
                    close();
                    navigate("/account");
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                >
                  <UserIcon className="w-5 h-5" />
                  Account
                </button>
                <button
                  onClick={() => {
                    close();
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-3 text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </Popover>
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
