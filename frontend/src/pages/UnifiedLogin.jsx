import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../utils/api";
import RedirectOverlay from "../components/common/RedirectOverlay";
import Toast from "../components/common/Toast";
import shyvoraLogo from "../assets/images/shyvora_s_logo.png";

const UnifiedLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type = "success") => setToast({ message, type });

  React.useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(
        location.state.toastMessage,
        location.state.toastType || "success",
      );
      const newState = { ...location.state };
      delete newState.toastMessage;
      delete newState.toastType;
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { 
        username: username.trim(), 
        password,
        rememberMe
      });

      const { user, token } = res.data;

      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("cms_token", token);
      localStorage.setItem("adminUsername", user.username);

      if (user.role) {
        localStorage.setItem("adminRole", user.role.name || "Student");
        localStorage.setItem(
          "userPermissions",
          JSON.stringify(user.role.permissions || {}),
        );
      } else {
        localStorage.setItem("adminRole", "Student");
        localStorage.setItem("userPermissions", JSON.stringify({}));
      }

      if (user.studentProfile) {
        localStorage.setItem("studentId", user.studentProfile);
      }

      setIsRedirecting(true);
      setTimeout(() => {
      if (user.role && user.role.name === "Student") {
        localStorage.setItem("studentToken", token);
        navigate("/erp/dashboard", {
          state: { toastMessage: "Login successful!", toastType: "success" },
        });
      } else {
          navigate("/admin/dashboard", {
            state: { toastMessage: "Login successful!", toastType: "success" },
          });
        }
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid credentials",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f9ff]">
      {/* Left Pane - Educational Branding & Overview (Visible on desktop & large tablets) */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-8 xl:p-14 bg-white border-r border-gray-100 relative overflow-hidden">
        {/* Ambient Subtle Gradients */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-100/40 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-blue-100/30 blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-10 xl:mb-14">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-md shrink-0">
              <img src={shyvoraLogo} alt="Shyvora ERP Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tight block leading-tight">
                Shyvora
              </span>
              <span className="text-[11px] font-bold text-[#6D4C9C] tracking-widest uppercase block">
                Technologies
              </span>
            </div>
          </div>

          {/* Hero Pitch */}
          <div className="max-w-xl">
            <span className="inline-block text-[11px] font-extrabold text-[#6D4C9C] uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full mb-4">
              Smart • Secure • Simplified
            </span>
            <h1 className="text-3xl xl:text-5xl font-black text-gray-900 leading-[1.15] mb-4">
              One ERP.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D4C9C] to-[#3b82f6]">
                Unlimited Possibilities.
              </span>
            </h1>
            <p className="text-sm xl:text-base text-gray-600 mb-8 leading-relaxed">
              Empowering educational institutions with secure, multi-tenant academic, administrative, and compliance management.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { icon: "fa-graduation-cap", label: "Academics", path: "/authentication/index" },
                { icon: "fa-clipboard-user", label: "Attendance", path: "/authentication/index" },
                { icon: "fa-indian-rupee-sign", label: "Finance & Fees", path: "/authentication/index" },
                { icon: "fa-shield-halved", label: "Zero-Trust", path: "/privacy" },
                { icon: "fa-scale-balanced", label: "DPDP 2026", path: "/privacy" },
                { icon: "fa-hand-holding-heart", label: "UGC Welfare", path: "/safety" },
              ].map((feat, i) => (
                <Link 
                  key={i} 
                  to={feat.path}
                  className="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-purple-50/70 hover:border-purple-200 transition-all rounded-xl border border-gray-100 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[#6D4C9C] text-xs group-hover:scale-105 transition-transform">
                    <i className={`fas ${feat.icon}`}></i>
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#6D4C9C] truncate transition-colors">{feat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Left Bottom Institutional Proof */}
        <div className="relative z-10 pt-8 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold text-gray-600">Enterprise Campus Operating System</span>
          <span className="font-mono text-[11px]">CERT-In & DPDP Ready</span>
        </div>
      </div>

      {/* Right Pane - Form & Controls (100% responsive for all heights & widths) */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 min-h-screen">
        {/* Top Control Bar in Document Flow (Never Overlaps) */}
        <div className="w-full max-w-[420px] flex items-center justify-between py-2 sm:py-3 mb-2">
          {/* Mobile brand (hidden on desktop) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src={shyvoraLogo} alt="Shyvora ERP Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm text-gray-900">Shyvora ERP</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-xs hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-globe text-gray-400 text-xs"></i> English
              <i className="fas fa-chevron-down text-[10px] text-gray-400 ml-0.5"></i>
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-xs text-gray-600 hover:bg-gray-50 transition-colors"
              title="Toggle Theme"
            >
              <i className="fas fa-moon text-xs"></i>
            </button>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="w-full max-w-[420px] bg-white p-6 sm:p-8 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.03)] border border-gray-100 my-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Sign in to your institutional account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username or Email Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4C9C] focus:border-transparent transition-all placeholder:text-gray-400"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="superadmin or admin@Shyvora.in"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <i className="fas fa-lock text-xs"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4C9C] focus:border-transparent transition-all placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#6D4C9C] transition-colors"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}></i>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
                <i className="fas fa-circle-exclamation text-xs flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-[#6D4C9C] focus:ring-[#6D4C9C] border-gray-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact your campus System Administrator to reset credentials.");
                }}
                className="text-xs font-bold text-[#6D4C9C] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#6D4C9C] hover:bg-[#5b3e85] active:scale-[0.99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="fas fa-arrow-right text-[11px]"></i>
                </>
              )}
            </button>

            {/* 1-Click Client Demo Quick-Fill Credentials */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Demo Quick-Fill</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setUsername("superadmin");
                    setPassword("SuperAdmin@123");
                  }}
                  className="px-2 py-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-[#6D4C9C] text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Auto-fill SuperAdmin credentials"
                >
                  <i className="fas fa-shield-halved text-[9px]"></i>
                  <span>SuperAdmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("instadmin");
                    setPassword("SuperAdmin@123");
                  }}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Auto-fill Campus Admin credentials"
                >
                  <i className="fas fa-building-columns text-[9px]"></i>
                  <span>CampusAdmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("student");
                    setPassword("Student@123");
                  }}
                  className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Auto-fill Student Portal credentials"
                >
                  <i className="fas fa-graduation-cap text-[9px]"></i>
                  <span>Student</span>
                </button>
              </div>
            </div>
          </form>

          {/* Security Features Row inside Card */}
          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px]">
                <i className="fas fa-shield-halved"></i>
              </div>
              <span className="text-[10px] font-bold text-gray-700">SSL Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-gray-100">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                <i className="fas fa-lock"></i>
              </div>
              <span className="text-[10px] font-bold text-gray-700">256-bit Security</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-[10px]">
                <i className="fas fa-certificate"></i>
              </div>
              <span className="text-[10px] font-bold text-gray-700">DPDP Ready</span>
            </div>
          </div>
        </div>

        {/* Public Compliance & Statutory Links */}
        <div className="w-full max-w-[420px] mt-4 p-3 rounded-2xl bg-white/80 border border-gray-100 shadow-2xs flex items-center justify-around text-xs">
          <Link 
            to="/safety" 
            className="flex items-center gap-1.5 text-gray-600 hover:text-rose-600 font-bold transition-colors"
            title="UGC Anti-Ragging, Equity & POSH Redressal Portal"
          >
            <i className="fas fa-hand-holding-heart text-rose-500 text-xs"></i>
            <span>Safety & Anti-Ragging</span>
          </Link>
          <span className="text-gray-300">•</span>
          <Link 
            to="/privacy" 
            className="flex items-center gap-1.5 text-gray-600 hover:text-[#6D4C9C] font-bold transition-colors"
            title="DPDP Privacy Charter & Data Subject Rights"
          >
            <i className="fas fa-scale-balanced text-[#6D4C9C] text-xs"></i>
            <span>Privacy & DPDP</span>
          </Link>
        </div>

        {/* Footer in Flow - Never overlaps, adapts to any height */}
        <div className="w-full max-w-[420px] py-3 px-2 flex justify-between items-center text-[11px] text-gray-400 font-medium">
          <span>
            Powered by <strong className="text-[#6D4C9C]">Shyvora Technologies</strong>
          </span>
          <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            {typeof window !== 'undefined' ? window.location.host : 'Shyvora Campus OS'}
          </span>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {isRedirecting && <RedirectOverlay message="Logging in..." />}
    </div>
  );
};

export default UnifiedLogin;
