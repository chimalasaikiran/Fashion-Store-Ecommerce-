import React, { useState, useEffect } from 'react';
import fashionLogo from '../../assets/fashion_logo.png';
import googleIcon from '../../assets/google_icon.svg';
import captchaRefresh from '../../assets/captcha_refresh.svg';
import signinArrow from '../../assets/signin_arrow.svg';
import dashboardIllustration from '../../assets/fashion_dashboard.png';

export default function SignIn({ onSignInSuccess }: { onSignInSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('xR4pZ');
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate a random 5-character alphanumeric CAPTCHA
  const handleRefreshCaptcha = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  // Automatically refresh CAPTCHA on component mount / page load
  useEffect(() => {
    handleRefreshCaptcha();
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (!email.trim()) {
      setError('Please enter your Email Address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid Email Address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (captchaInput !== captcha) {
      setError('Security verification code does not match. Please try again.');
      return;
    }

    // Real login API call
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');
    fetch(`${API_URL}/admins/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem('adminToken', data.data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
          setSuccess('Successfully signed in to Fashion Store Admin Panel!');
          setTimeout(() => {
            setLoading(false);
            onSignInSuccess();
          }, 800);
        } else {
          setLoading(false);
          setError(data.message || 'Invalid email or password.');
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error('Login Error:', err);
        setError('Unable to connect to the backend server. Please verify it is running on port 5000.');
      });
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#F6F6F6] text-[#242424]">
      {/* Left Side - Login Form Container */}
      <section className="w-full md:w-[50%] lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center px-4 py-8 sm:px-12 md:px-8 lg:px-20 min-h-screen bg-white">
        <div className="w-full max-w-[400px] sm:max-w-[448px] space-y-6 sm:space-y-8 md:space-y-10">
          
          {/* Logo Header */}
          <header className="flex items-center gap-2 select-none">
            <div className="flex items-center justify-center w-8 h-8">
              <img src={fashionLogo} alt="Fashion Store Logo" className="w-15 h-15 object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#401900] font-sans">
              Fashion Store Admin
            </h1>
          </header>

          {/* Welcome Header */}
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#242424]">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-[#797979]">
              Please enter your details to sign in
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="flex items-center gap-3 bg-[#FFEBEE] border-l-4 border-[#E53935] rounded-r-lg px-4 py-3 text-xs sm:text-sm text-[#B71C1C] animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-[#E8F5E9] border-l-4 border-[#4CAF50] rounded-r-lg px-4 py-3 text-xs sm:text-sm text-[#1B5E20] animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
            
            {/* Email Address */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="email" className="block text-[10px] sm:text-xs font-semibold text-[#797979] tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative border border-[#E0E0E0] focus-within:border-[#F8B057] focus-within:ring-1 focus-within:ring-[#F8B057] rounded-lg bg-[#F6F6F6] shadow-sm transition-all">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent py-3 sm:py-3.5 px-4 outline-none text-sm sm:text-base text-[#242424] placeholder-[#6B7280]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="password" className="block text-[10px] sm:text-xs font-semibold text-[#797979] tracking-wider uppercase">
                Password
              </label>
              <div className="relative border border-[#E0E0E0] focus-within:border-[#F8B057] focus-within:ring-1 focus-within:ring-[#F8B057] rounded-lg bg-[#F6F6F6] shadow-sm flex items-center transition-all">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent py-3 sm:py-3.5 px-4 outline-none text-sm sm:text-base text-[#242424] placeholder-[#6B7280]"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 sm:px-4 py-2 text-[#797979] hover:text-[#242424] transition-colors focus:outline-none flex items-center justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link is handled by administration.');
                  }}
                  className="text-[10px] sm:text-xs font-bold text-[#401900] hover:text-[#F8B057] tracking-wider uppercase hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* CAPTCHA / Verification Section */}
            <div className="bg-[#F6F6F6] border border-[#E0E0E0] rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#797979] tracking-wider uppercase">
                  SECURITY VERIFICATION
                </span>
                
                {/* Visual CAPTCHA Box */}
                <div className="bg-white border border-[#E0E0E0] rounded px-2 sm:px-3 py-1 flex items-center gap-2 sm:gap-3 select-none flex-shrink-0">
                  <span className="text-base sm:text-lg font-bold italic tracking-widest text-[#401900] font-mono select-none pointer-events-none">
                    {captcha}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none"
                    aria-label="Refresh security verification"
                  >
                    <img src={captchaRefresh} alt="Refresh" className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px]" />
                  </button>
                </div>
              </div>

              {/* CAPTCHA Input */}
              <div className="relative border border-[#E0E0E0] focus-within:border-[#F8B057] focus-within:ring-1 focus-within:ring-[#F8B057] rounded-lg bg-white shadow-sm transition-all">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Type the characters above"
                  className="w-full bg-transparent py-2.5 sm:py-3 px-4 outline-none text-sm sm:text-base text-[#242424] placeholder-[#6B7280] text-center"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 sm:py-3.5 px-4 bg-[#401900] hover:bg-[#2D1100] text-white font-semibold text-base sm:text-lg rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span>Sign In</span>
                  <img src={signinArrow} alt="Sign In Arrow" className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px]" />
                </>
              )}
            </button>

            {/* OR Divider */}
            <div className="flex items-center gap-3 sm:gap-4 py-1.5 sm:py-2 select-none">
              <div className="flex-grow border-t border-[#E0E0E0]" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#797979] tracking-widest uppercase">
                OR CONTINUE WITH
              </span>
              <div className="flex-grow border-t border-[#E0E0E0]" />
            </div>

            {/* Google Social Login */}
            <button
              type="button"
              onClick={() => alert('Google authentication is configured for testing.')}
              className="w-full border border-[#E0E0E0] hover:bg-[#F6F6F6] text-[#797979] font-medium text-sm sm:text-base py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-3 transition-all cursor-pointer bg-white"
            >
              <img src={googleIcon} alt="Google" className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
              <span>Sign in with Google</span>
            </button>

          </form>

          {/* Footer Link */}
          <footer className="text-center text-xs sm:text-sm text-[#797979] pt-2">
            Please contact the administrator to create an account.
          </footer>

        </div>
      </section>

      {/* Right Side - Brand Showcase */}
      <section className="hidden md:flex md:w-[50%] lg:w-[55%] xl:w-[60%] bg-[#401900] text-white flex-col justify-between p-8 md:p-12 lg:p-24 relative overflow-hidden select-none min-h-screen">
        
        {/* Background Atmospheric Circle Decorations */}
        <div className="absolute bg-[#F8B057] opacity-[0.05] rounded-full w-[800px] h-[800px] -top-[400px] left-[106.67px] pointer-events-none" />
        <div className="absolute bg-[#F8B057] opacity-[0.03] rounded-full w-[600px] h-[600px] top-[492.5px] -left-[150px] pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 space-y-4 lg:space-y-6 max-w-[448px] mt-6 md:mt-10 lg:mt-0">
          <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-[42px] font-extrabold leading-tight sm:leading-[40px] lg:leading-[52px] tracking-tight">
            The simplest way to manage your fashion store
          </h2>
          <p className="text-white/80 text-xs sm:text-sm md:text-base leading-5 sm:leading-6 font-normal">
            Access your dashboard to manage products, orders, and customers with real-time analytics and sales insights.
          </p>
        </div>

        {/* Central Illustration Container */}
        <div className="relative z-10 flex items-center justify-center py-6 md:py-8 lg:py-0 w-full">
          <div className="bg-white/10 border border-white/20 p-3 sm:p-4 md:p-5 rounded-[24px] shadow-2xl backdrop-blur-md max-w-full overflow-hidden flex items-center justify-center">
            <img
              src={dashboardIllustration}
              alt="Dashboard Illustration"
              className="rounded-lg max-w-full h-auto object-cover max-h-[220px] sm:max-h-[260px] md:max-h-[300px] lg:max-h-[357px]"
              style={{ width: '487px' }}
            />
          </div>
        </div>

        {/* Spacing alignment helper */}
        <div className="hidden lg:block h-6" />
      </section>
    </main>
  );
}
