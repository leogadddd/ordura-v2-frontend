import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { register } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { useOptions } from "@/context/OptionsProvider";
import { resetRedirectFlag } from "@/lib/apiClient";

export function RegisterPage({ isInitialSetup }: { isInitialSetup?: boolean }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    roleId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { roles, isLoadingRoles, refreshRoles } = useOptions();

  useEffect(() => {
    // Fetch roles if not already loaded
    if (!roles && !isLoadingRoles) {
      refreshRoles();
    }
  }, [roles, isLoadingRoles, refreshRoles]);

  // Set default admin role for initial setup
  useEffect(() => {
    if (isInitialSetup && roles && roles.length > 0) {
      const adminRole = roles.find(
        (role) => role.name.toLowerCase() === "administrator"
      );
      if (adminRole) {
        setFormData((prev) => ({ ...prev, roleId: adminRole.id }));
      }
    }
  }, [isInitialSetup, roles]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        roleId: formData.roleId || undefined,
      });

      // Reset redirect flag on successful registration (do this before any
      // further requests/side-effects to avoid a stale redirect flag causing a
      // full page navigation from the axios interceptor)
      resetRedirectFlag();

      // Save user to store
      if (response.data?.user) {
        setUser(response.data.user);
      }

      // Redirect to root on success
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Ordura POS</h1>
          <p className="text-gray-600">
            {isInitialSetup
              ? "Create the first admin account"
              : "Create your account"}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
              />
              <Input
                id="lastName"
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Doe"
              />
            </div>

            <Select
              label="Role"
              placeholder={
                isLoadingRoles ? "Loading roles..." : "Select a role"
              }
              value={formData.roleId}
              onChange={(e) => handleChange("roleId", e.target.value as string)}
              options={(roles || []).map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              disabled={isLoadingRoles || isInitialSetup}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              required
            />

            <Input
              id="username"
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="johndoe"
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full shadow-md hover:shadow-lg"
              size="lg"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary-light font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
