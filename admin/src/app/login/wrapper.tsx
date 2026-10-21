'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAdminPrefix } from '@/lib/useAdminPrefix';
import { LoginHeader } from './LoginHeader';
import { LoginForm } from './LoginForm';
import { AdminFirstRunSetup } from '@/components/AdminFirstRunSetup';
import { WifiOff, RefreshCw, Loader2 } from 'lucide-react';

// Safe localStorage accessor outside render cycle to eliminate memory thrashing
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },
};

export default function Wrapper() {
  const router = useRouter();
  const prefix = useAdminPrefix();
  const isMountedRef = useRef(true);

  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [forceSetup, setForceSetup] = useState(false);

  const [serverOffline, setServerOffline] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState('');
  const [retryingServer, setRetryingServer] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [siteTitle, setSiteTitle] = useState('');

  // Check setup status and server connectivity
  const checkServerAndSetup = useCallback(async () => {
    try {
      setRetryingServer(true);
      const res = await fetch('/api/auth/setup-status', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const status = await res.json();

      if (isMountedRef.current) {
        if (status?.databaseConnected === false) {
          setServerOffline(true);
          setOfflineMessage(status?.error || 'Database connection offline. Please verify PostgreSQL is running.');
        } else {
          setServerOffline(false);
          setOfflineMessage('');
          if (status?.isSetupRequired) {
            setIsSetupRequired(true);
          } else {
            setIsSetupRequired(false);
          }
        }
      }
    } catch {
      if (isMountedRef.current) {
        setServerOffline(true);
        setOfflineMessage('Cannot connect to port 8585. Please verify backend is running.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsCheckingSetup(false);
        setRetryingServer(false);
      }
    }
  }, []);

  // Check setup status and authentication
  useEffect(() => {
    isMountedRef.current = true;

    // Check if ?setup=true or ?setup=1 in URL query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('setup') === 'true' || params.get('setup') === '1') {
        setForceSetup(true);
      }
    }

    // 1. Check if First-Run Setup is required & server is online
    checkServerAndSetup();

    // 2. Load site settings for branding title
    fetchApi('/settings/public')
      .then((data) => {
        if (isMountedRef.current && data && (data.store_name_en || data.store_name)) {
          setSiteTitle(data.store_name_en || data.store_name);
        }
      })
      .catch(() => {});

    // 3. Check existing valid session
    const existingToken = safeStorage.getItem('sf_admin_token');
    const existingUser = safeStorage.getItem('sf_admin_user');
    if (existingToken && existingUser) {
      router.push(prefix || '/');
      return;
    }

    // 4. Auto-populate remembered email
    const savedEmail = safeStorage.getItem('sf_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [checkServerAndSetup, prefix, router]);

  // Handle Form Submission
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const sanitizedEmail = email.trim().toLowerCase();
      if (!sanitizedEmail || !password) {
        setError('Please enter both your email address and password.');
        return;
      }

      if (loading) return;

      setLoading(true);
      setError('');

      try {
        const res = await fetchApi('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: sanitizedEmail,
            email: sanitizedEmail,
            password: password,
          }),
        });

        if (res && res.accessToken) {
          // Store token and user
          safeStorage.setItem('sf_admin_token', res.accessToken);
          safeStorage.setItem('sf_admin_user', JSON.stringify(res.user || {}));

          if (rememberMe) {
            safeStorage.setItem('sf_remember_email', sanitizedEmail);
          } else {
            safeStorage.removeItem('sf_remember_email');
          }

          if (isMountedRef.current) {
            setLoginSuccess(true);
            setLoading(false);
          }

          // Trigger navigation
          setTimeout(() => {
            window.location.href = prefix || '/';
          }, 300);
        } else {
          throw new Error(res?.message || 'Authentication failed. Please check credentials.');
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          setError(err.message || 'Invalid email or password.');
          setLoading(false);
        }
      }
    },
    [email, password, loading, rememberMe, prefix]
  );

  // While checking setup status
  if (isCheckingSetup) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If first-time setup is required (or forced by URL), render the clean setup wizard
  if (isSetupRequired || forceSetup) {
    return (
      <AdminFirstRunSetup
        onSetupComplete={() => {
          window.location.href = prefix || '/';
        }}
      />
    );
  }

  // Otherwise render standard login screen
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative">
        {/* Server Offline Alert Banner */}
        {serverOffline && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-950">Backend Server Offline</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  {offlineMessage || 'Cannot connect to port 8585. Please verify backend is running.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={checkServerAndSetup}
              disabled={retryingServer}
              className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 ${retryingServer ? 'animate-spin' : ''}`} />
              <span>{retryingServer ? 'Checking...' : 'Retry'}</span>
            </button>
          </div>
        )}

        {/* 1. Header */}
        <LoginHeader siteTitle={siteTitle} />

        {/* 2. Login Form */}
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          loading={loading}
          error={error}
          loginSuccess={loginSuccess}
          onSubmit={handleLogin}
        />
      </div>
    </div>
  );
}
