'use client';

import React from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  loading: boolean;
  error: string;
  loginSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm = React.memo(function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  loading,
  error,
  loginSuccess,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loginSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">Authentication successful! Redirecting...</span>
        </div>
      )}

      {/* Email / Username / Phone Field */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Email, Username, or Phone</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@yourdomain.com"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300"
          />
          <span>Remember me on this device</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || loginSuccess}
        className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 mt-1"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
});

export default LoginForm;
