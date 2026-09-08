import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hook/useAuth';
import Cntinuewithgoogle from '../components/Cntinuewithgoogle';

const Login = () => {
  const { handleLogin, loading, error, success } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await handleLogin({ email: formData.email, password: formData.password });
      if (res?.success) {
        const role = res.user?.role || res.data?.user?.role;
        if (role === "buyer") {
          navigate("/");
        } else if (role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };




  return (
    <div className="min-h-screen w-full bg-[#FBF9F5] text-neutral-900 grid grid-cols-1 lg:grid-cols-2 font-sans selection:bg-neutral-900 selection:text-white">
      <div className="relative hidden lg:block h-full min-h-screen overflow-hidden bg-neutral-900">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop"
          alt="Whitmore Editorial"
          className="w-full h-full object-cover opacity-90 scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white z-10">
          <div className="flex items-center justify-between">
            <span className="text-xl font-black tracking-widest uppercase">WHITMORE</span>
            <span className="text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
              AUTUMN / WINTER '26
            </span>
          </div>

          <div className="max-w-md space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              EXCLUSIVE ATELIER
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Redefining Modern Fashion & Luxury Marketplace.
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed font-light">
              Step into a curated space built for style visionaries, creators, and sellers across the globe.
            </p>
          </div>

          <div className="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-neutral-400">
            <span>© 2026 WHITMORE INC.</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 bg-[#FBF9F5]">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="lg:hidden mb-4">
              <span className="text-xl font-black tracking-widest uppercase text-neutral-900">WHITMORE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              Welcome Back
            </h1>
            <p className="text-neutral-500 text-sm">
              Please enter your details to access your account.
            </p>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Sign In Successful!</p>
                <p className="text-emerald-700 mt-0.5">Redirecting to your home page...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Authentication Error</p>
                <p className="text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 ml-0.5"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3.5 py-3 bg-white border ${formErrors.email
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-black/5'
                    } rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm shadow-sm`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-red-600 ml-0.5 font-medium">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 ml-0.5"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-white border ${formErrors.password
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-black/5'
                    } rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[11px] text-red-600 ml-0.5 font-medium">{formErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-neutral-300 bg-white text-neutral-900 focus:ring-black/20 accent-neutral-900 cursor-pointer"
                />
                <span className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
                  Remember this device
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-[#FBF9F5] px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest shrink-0">
              OR
            </span>
            <div className="border-t border-neutral-200 w-full" />
          </div>

          <Cntinuewithgoogle text="Continue with Google" />

          <div className="pt-4 text-center">
            <p className="text-xs text-neutral-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-neutral-900 hover:underline underline-offset-4 transition-all ml-1"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;