import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hook/useAuth';
import Cntinuewithgoogle from '../components/Cntinuewithgoogle';

const Register = () => {
  const { handleRegister, loading, error, success } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.fullname.trim()) {
      errors.fullname = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.contact.trim()) {
      errors.contact = 'Contact is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Min. 6 characters required';
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

    const result = await handleRegister({
      fullname: formData.fullname,
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      isSeller: formData.isSeller,
    });

    if (result?.success) {
      setFormData({
        fullname: '',
        email: '',
        contact: '',
        password: '',
        isSeller: false,
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden bg-mesh">
      {/* Golden ambient background lights */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container - Compact Professional Layout */}
      <div className="w-full max-w-2xl relative z-10 my-auto">
        {/* Top subtle badge */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-amber-400/20 text-amber-300 text-xs font-medium backdrop-blur-md shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Join Our Exclusive Platform</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 hover:border-amber-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
              Create an account
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Experience seamless commerce with bespoke tools for buyers and sellers.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5 text-amber-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">Registration Successful!</p>
                <p className="text-amber-200/80 mt-0.5">Your account has been created. Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-red-200">Registration Error</p>
                <p className="text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            
            {/* 2-Column Grid on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="fullname" 
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 ml-1"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border ${
                      formErrors.fullname 
                        ? 'border-red-500/60 focus:border-red-500' 
                        : 'border-zinc-800/90 hover:border-zinc-700 focus:border-amber-400/70'
                    } rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all duration-200 text-xs sm:text-sm`}
                  />
                </div>
                {formErrors.fullname && (
                  <p className="text-[11px] text-red-400 ml-1">{formErrors.fullname}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="email" 
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border ${
                      formErrors.email 
                        ? 'border-red-500/60 focus:border-red-500' 
                        : 'border-zinc-800/90 hover:border-zinc-700 focus:border-amber-400/70'
                    } rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all duration-200 text-xs sm:text-sm`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-red-400 ml-1">{formErrors.email}</p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="contact" 
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 ml-1"
                >
                  Contact Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="contact"
                    name="contact"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.contact}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border ${
                      formErrors.contact 
                        ? 'border-red-500/60 focus:border-red-500' 
                        : 'border-zinc-800/90 hover:border-zinc-700 focus:border-amber-400/70'
                    } rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all duration-200 text-xs sm:text-sm`}
                  />
                </div>
                {formErrors.contact && (
                  <p className="text-[11px] text-red-400 ml-1">{formErrors.contact}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 ml-1"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 bg-zinc-950/60 border ${
                      formErrors.password 
                        ? 'border-red-500/60 focus:border-red-500' 
                        : 'border-zinc-800/90 hover:border-zinc-700 focus:border-amber-400/70'
                    } rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all duration-200 text-xs sm:text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
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
                  <p className="text-[11px] text-red-400 ml-1">{formErrors.password}</p>
                )}
              </div>
            </div>

            {/* isSeller Checkbox Section - Clean & Standalone */}
            <label 
              htmlFor="isSeller"
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                formData.isSeller 
                  ? 'bg-amber-500/[0.07] border-amber-400/40 shadow-sm shadow-amber-500/10' 
                  : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              <input
                id="isSeller"
                name="isSeller"
                type="checkbox"
                checked={formData.isSeller}
                onChange={handleChange}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400/30 accent-amber-400 cursor-pointer shrink-0"
              />
              <div className="flex-1 flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <Store className={`w-3.5 h-3.5 ${formData.isSeller ? 'text-amber-400' : 'text-zinc-400'} transition-colors`} />
                  <span className="text-xs font-semibold text-zinc-200">
                    Register as a Seller
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    Vendor
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  Access merchant dashboard & sell directly
                </p>
              </div>
            </label>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl transition-all duration-300 group-hover:scale-105" />
                <div className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 group-hover:brightness-105 shadow-md shadow-amber-500/20">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </div>

          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-800/80 w-full" />
            <span className="bg-zinc-900/90 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider shrink-0">
              Or continue with
            </span>
            <div className="border-t border-zinc-800/80 w-full" />
          </div>

          {/* Continue with Google Button */}
          <Cntinuewithgoogle text="Continue with Google" />

          {/* Footer Navigation */}
          <div className="mt-4 pt-3.5 border-t border-zinc-800/60 text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline transition-colors ml-1"
              >
                Sign in here
              </Link>
            </p>
          </div>

        </div>

        {/* Bottom subtle brand watermark */}
        <div className="text-center mt-3">
          <p className="text-[11px] text-zinc-600">
            Protected by modern encryption • Powered by Whitmore
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
