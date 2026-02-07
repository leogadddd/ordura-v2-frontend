import { useEffect, useState, useRef, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { routes } from "./routes";
import { useAuthStore } from "./store/authStore";
import { getCurrentUser, checkInitStatus } from "./api/authApi";
import Loading from "./components/Loading";
import AppLayout from "./layouts/AppLayout";
import PageNotFound from "./pages/PageNotFound";

const renderRoutes = (items: typeof routes.top, isNested = false) => {
  return items.map((item) => {
    if (item.children) {
      return (
        <Route
          key={item.to}
          path={item.to}
          element={
            <Suspense fallback={<Loading />}>
              <AppLayout>
                {item.component ? <item.component /> : <Outlet />}
              </AppLayout>
            </Suspense>
          }
        >
          <Route index element={<Navigate to="sales" replace />} />
          {renderRoutes(item.children, true)}
        </Route>
      );
    } else {
      const element = (
        <Suspense fallback={<Loading />}>
          {item.component ? <item.component /> : <div>Page not found</div>}
        </Suspense>
      );
      return (
        <Route
          key={item.to}
          path={item.to}
          element={isNested ? element : <AppLayout>{element}</AppLayout>}
        />
      );
    }
  });
};

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
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  // Redirect to login if there's no authenticated user (normal app flow)
  useEffect(() => {
    if (initLoading) return; // don't redirect while initializing
    if (!hasAdmin) return; // allow register flow during initial setup

    if (!currentUser) {
      if (pathname !== "/login" && pathname !== "/register") {
        navigate("/login", { replace: true });
      }
    }
  }, [initLoading, hasAdmin, currentUser, navigate, pathname]);

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
    return <Loading />;
  }

  // If no admin exists, only show register page
  if (!hasAdmin) {
    return (
      <Routes>
        {[...routes.essentials].map((route) => (
          <Route
            key={route.to}
            path={route.to}
            element={
              <Suspense fallback={<Loading />}>
                {route.component ? (
                  <route.component />
                ) : (
                  <div>Page not found</div>
                )}
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
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
      {[...routes.essentials].map((route) => (
        <Route
          key={route.to}
          path={route.to}
          element={
            <Suspense fallback={<Loading />}>
              {route.component ? (
                <route.component />
              ) : (
                <div>Page not found</div>
              )}
            </Suspense>
          }
        />
      ))}
      {renderRoutes(routes.top)}
      {renderRoutes(routes.bottom)}
      <Route
        path="*"
        element={
          currentUser ? (
            <AppLayout>
              <PageNotFound />
            </AppLayout>
          ) : (
            <PageNotFound />
          )
        }
      />
    </Routes>
  );
}

export default App;
