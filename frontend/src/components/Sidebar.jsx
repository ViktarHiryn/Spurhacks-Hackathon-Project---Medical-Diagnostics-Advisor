import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageCircle,
  Pill,
  History,
  Settings,
  User,
  Stethoscope,
  X,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  // Mock users state - holds objects { username, password, role }
  const [users, setUsers] = useState([
    { username: "testuser", password: "test1234", role: "Patient" }, // example user
  ]);

  // User session state
  const [user, setUser] = useState(null); // currently logged in user
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const navItems = [
    {
      path: "/chat",
      icon: MessageCircle,
      label: "AI Doctor Chat",
      description: "Chat & video analysis with AI doctor",
    },
    {
      path: "/medications",
      icon: Pill,
      label: "Medications",
      description: "Track your medications",
    },
    {
      path: "/history",
      icon: History,
      label: "Medical History",
      description: "View past consultations",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setAuthError("");
    setUsernameInput("");
    setPasswordInput("");
  };
  const closeAuth = () => setAuthOpen(false);
  const handleLogout = () => setUser(null);

  const validateInputs = () => {
    if (usernameInput.trim() === "" || passwordInput.trim() === "") {
      setAuthError("Please enter both username and password.");
      return false;
    }
    if (passwordInput.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return false;
    }
    return true;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    if (!validateInputs()) return;

    // Find user in mock DB
    const existingUser = users.find(
      (u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase()
    );

    if (!existingUser) {
      setAuthError("User does not exist. Please register.");
      return;
    }

    // Check password match (mock check)
    if (existingUser.password !== passwordInput) {
      setAuthError("Invalid password.");
      return;
    }

    // Success: set user and close modal
    setUser({ name: existingUser.username, role: existingUser.role });
    closeAuth();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    if (!validateInputs()) return;

    // Check if username already exists
    const existingUser = users.find(
      (u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase()
    );

    if (existingUser) {
      setAuthError("Username already taken.");
      return;
    }

    // Add new user to mock DB
    const newUser = {
      username: usernameInput.trim(),
      password: passwordInput,
      role: "Patient",
    };
    setUsers((prev) => [...prev, newUser]);

    // Auto-login after register
    setUser({ name: newUser.username, role: newUser.role });
    closeAuth();
  };

  return (
    <div className="w-80 bg-white border-r border-neutral-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <Link
          to="/"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary-700 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">VitAI</h1>
            <p className="text-sm text-neutral-600">
              Advanced Medical AI Assistant
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : "hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${
                    isActive(item.path)
                      ? "text-primary-600"
                      : "text-neutral-500 group-hover:text-neutral-700"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        {!user ? (
          <div
            onClick={() => openAuth("login")}
            className="flex items-center p-3 rounded-lg hover:bg-neutral-50 cursor-pointer select-none"
            title="Click to Login or Register"
          >
            <div className="bg-neutral-200 p-2 rounded-full">
              <User className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium text-neutral-900">Anonymous User</div>
              <div className="text-xs text-neutral-500">Patient</div>
            </div>
            <Settings className="w-4 h-4 text-neutral-400" />
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
            <div className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <div className="font-medium text-primary-700">{user.name}</div>
                <div className="text-xs text-primary-600">{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-primary-700 font-semibold hover:underline"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {authOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold capitalize">{authMode}</h2>
              <button onClick={closeAuth} aria-label="Close auth modal">
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form
              onSubmit={
                authMode === "login" ? handleLoginSubmit : handleRegisterSubmit
              }
            >
              <label className="block mb-2 font-medium" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full border border-neutral-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your username"
                required
              />

              <label className="block mb-2 font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border border-neutral-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your password"
                required
              />

              {authError && (
                <div className="mb-4 text-sm text-red-600">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
              >
                {authMode === "login" ? "Log In" : "Register"}
              </button>
            </form>
            <div className="mt-4 text-center text-sm text-primary-600">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                      setUsernameInput("");
                      setPasswordInput("");
                    }}
                    className="underline font-semibold"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setUsernameInput("");
                      setPasswordInput("");
                    }}
                    className="underline font-semibold"
                  >
                    Log in here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
