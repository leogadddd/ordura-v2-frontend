import { useLocation, Link } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6 mt-6">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="flex gap-4">
          <Link to="/dashboard">
            <Button
              className="flex-1 flex items-center justify-center gap-2"
              variant="primary"
              size="lg"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
            className="flex-1 "
          >
            Go Back
          </Button>
        </div>

        {/* Developer Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
              Developer Information
            </summary>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm font-mono">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Pathname:</span>{" "}
                  {location.pathname}
                </div>
                <div>
                  <span className="font-semibold">Search:</span>{" "}
                  {location.search || "None"}
                </div>
                <div>
                  <span className="font-semibold">Hash:</span>{" "}
                  {location.hash || "None"}
                </div>
                <div>
                  <span className="font-semibold">State:</span>{" "}
                  {location.state
                    ? JSON.stringify(location.state, null, 2)
                    : "None"}
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600">
                If you're seeing this page unexpectedly, check the routing
                configuration in <code>routes.ts</code> or contact the
                development team.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
