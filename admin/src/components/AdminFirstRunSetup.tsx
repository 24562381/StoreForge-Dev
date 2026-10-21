'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Store,
  User,
  Mail,
  Lock,
  Phone,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Globe,
  Check,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AdminFirstRunSetupProps {
  onSetupComplete?: () => void;
}

interface ServerStatusState {
  status: 'checking' | 'online' | 'offline';
  latencyMs: number | null;
  message: string;
  checkedAt: string | null;
}

interface FormValues {
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
  confirmPassword: string;
  storeName: string;
  siteTitle: string;
  contactPhone: string;
  contactEmail: string;
  deliveryDhaka: string;
  deliveryOutside: string;
}

type FieldKey = keyof FormValues;
type FieldErrors = Partial<Record<FieldKey, string>>;

export function AdminFirstRunSetup({ onSetupComplete }: AdminFirstRunSetupProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [values, setValues] = useState<FormValues>({
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
    storeName: 'StoreForge',
    siteTitle: 'StoreForge E-Commerce',
    contactPhone: '',
    contactEmail: '',
    deliveryDhaka: '60',
    deliveryOutside: '120',
  });

  // Validation States
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Operation States
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Server Health Status
  const [serverStatus, setServerStatus] = useState<ServerStatusState>({
    status: 'checking',
    latencyMs: null,
    message: 'Checking server connection...',
    checkedAt: null,
  });
  const [isPinging, setIsPinging] = useState(false);

  // Field-level Validator
  const validateField = useCallback(
    (field: FieldKey, val: string, allVals: FormValues): string => {
      const trimmed = val.trim();

      switch (field) {
        case 'adminName':
          if (!trimmed) return 'Full name is required.';
          if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
          if (/^[0-9]+$/.test(trimmed)) return 'Name cannot consist of numbers only.';
          return '';

        case 'adminEmail':
          if (!trimmed) return 'Administrator email is required.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return 'Please enter a valid email address (e.g. admin@yourdomain.com).';
          }
          return '';

        case 'adminPhone':
          if (!trimmed) return 'Administrator phone number is required.';
          const cleanPhone = trimmed.replace(/[\s-]/g, '');
          if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(cleanPhone) && !/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
            return 'Please enter a valid mobile number (e.g. 01712345678 or +8801712345678).';
          }
          return '';

        case 'password':
          if (!val) return 'Password is required.';
          if (val.length < 6) return 'Password must be at least 6 characters long.';
          return '';

        case 'confirmPassword':
          if (!val) return 'Please re-type your password to confirm.';
          if (val !== allVals.password) {
            return 'Passwords do not match. Please verify both passwords are identical.';
          }
          return '';

        case 'storeName':
          if (!trimmed) return 'Store or brand name is required.';
          if (trimmed.length < 2) return 'Store name must be at least 2 characters.';
          return '';

        case 'siteTitle':
          if (!trimmed) return 'Website title is required.';
          if (trimmed.length < 3) return 'Website title must be at least 3 characters.';
          return '';

        case 'contactPhone':
          if (!trimmed) return 'Support phone number is required.';
          const cleanContact = trimmed.replace(/[\s-]/g, '');
          if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(cleanContact) && !/^\+?[0-9]{7,15}$/.test(cleanContact)) {
            return 'Please enter a valid support phone number (e.g. 01712345678).';
          }
          return '';

        case 'contactEmail':
          if (!trimmed) return 'Support email is required.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return 'Please enter a valid support email (e.g. support@yourdomain.com).';
          }
          return '';

        case 'deliveryDhaka':
          if (!trimmed) return 'Inside Dhaka delivery fee is required.';
          if (isNaN(Number(trimmed)) || Number(trimmed) < 0) {
            return 'Please enter a valid non-negative number (e.g. 60).';
          }
          return '';

        case 'deliveryOutside':
          if (!trimmed) return 'Outside Dhaka delivery fee is required.';
          if (isNaN(Number(trimmed)) || Number(trimmed) < 0) {
            return 'Please enter a valid non-negative number (e.g. 120).';
          }
          return '';

        default:
          return '';
      }
    },
    []
  );

  // Re-check single field when value changes
  const handleInputChange = (field: FieldKey, val: string) => {
    const updated = { ...values, [field]: val };
    setValues(updated);

    if (touched[field]) {
      const err = validateField(field, val, updated);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }

    // Auto-update confirmPassword error if password changed
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', values.confirmPassword, updated);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleBlur = (field: FieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, values[field], values);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Check Backend Server Status
  const checkServerHealth = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('/api/auth/setup-status', {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerStatus({
          status: 'online',
          latencyMs: latency,
          message: 'Backend server is active and connected to database',
          checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });

        // If setup is already done and not forced
        if (data && data.isSetupRequired === false) {
          setGeneralError('Initial setup has already been completed. Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      } else {
        setServerStatus({
          status: 'offline',
          latencyMs: null,
          message: `Server returned HTTP ${res.status}: ${res.statusText || 'Error'}`,
          checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
      }
    } catch (err: any) {
      clearTimeout(timer);
      const isTimeout = err?.name === 'AbortError';
      setServerStatus({
        status: 'offline',
        latencyMs: null,
        message: isTimeout
          ? 'Connection timed out (backend not responding within 6s)'
          : 'Unable to connect to backend server. Please verify backend is running on port 8585.',
        checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } finally {
      setIsPinging(false);
    }
  }, []);

  // Initial server ping on mount
  useEffect(() => {
    checkServerHealth();
  }, [checkServerHealth]);

  // Step 1 Validation & Proceed
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const step1Fields: FieldKey[] = ['adminName', 'adminEmail', 'adminPhone', 'password', 'confirmPassword'];
    const newErrors: FieldErrors = {};
    const newTouched: Partial<Record<FieldKey, boolean>> = { ...touched };

    let hasErrors = false;
    step1Fields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, values[f], values);
      if (err) {
        newErrors[f] = err;
        hasErrors = true;
      }
    });

    setTouched(newTouched);
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));

    if (hasErrors) {
      setGeneralError('Please fix the highlighted errors before continuing.');
      return;
    }

    // Auto-fill Step 2 defaults if currently empty
    setValues((prev) => ({
      ...prev,
      contactEmail: prev.contactEmail || prev.adminEmail.trim().toLowerCase(),
      contactPhone: prev.contactPhone || prev.adminPhone.trim(),
      siteTitle: prev.siteTitle || `${prev.storeName || 'StoreForge'} E-Commerce`,
    }));

    setStep(2);
  };

  // Final Setup Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const step2Fields: FieldKey[] = [
      'storeName',
      'siteTitle',
      'contactPhone',
      'contactEmail',
      'deliveryDhaka',
      'deliveryOutside',
    ];

    const newErrors: FieldErrors = {};
    const newTouched: Partial<Record<FieldKey, boolean>> = { ...touched };
    let hasErrors = false;

    // Check all fields to prevent any skipped validation
    const allFields: FieldKey[] = [
      'adminName',
      'adminEmail',
      'adminPhone',
      'password',
      'confirmPassword',
      ...step2Fields,
    ];

    allFields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, values[f], values);
      if (err) {
        newErrors[f] = err;
        hasErrors = true;
      }
    });

    setTouched(newTouched);
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));

    if (hasErrors) {
      // Check if the error is in Step 1
      const hasStep1Error = ['adminName', 'adminEmail', 'adminPhone', 'password', 'confirmPassword'].some(
        (f) => newErrors[f as FieldKey]
      );
      if (hasStep1Error) {
        setStep(1);
        setGeneralError('Some required administrator details in Step 1 need your attention.');
      } else {
        setGeneralError('Please correct the highlighted store settings below.');
      }
      return;
    }

    if (serverStatus.status === 'offline') {
      setGeneralError('Cannot submit: The backend server is unreachable. Please verify port 8585 is running.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: values.adminName.trim(),
        email: values.adminEmail.trim().toLowerCase(),
        password: values.password.trim(),
        phone: values.adminPhone.trim(),
        store_name: values.storeName.trim(),
        site_title: values.siteTitle.trim(),
        contact_phone: values.contactPhone.trim(),
        contact_email: values.contactEmail.trim().toLowerCase(),
        delivery_charge_dhaka: values.deliveryDhaka.trim(),
        delivery_charge_outside: values.deliveryOutside.trim(),
      };

      const res = await fetchApi('/auth/first-run-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res && res.accessToken) {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sf_admin_token', res.accessToken);
          localStorage.setItem('sf_admin_user', JSON.stringify(res.user || {}));
          localStorage.setItem('sf_remember_email', payload.email);
        }

        setSetupSuccess(true);

        setTimeout(() => {
          if (onSetupComplete) {
            onSetupComplete();
          } else {
            window.location.href = '/';
          }
        }, 1400);
      } else {
        throw new Error(res?.message || 'Failed to complete setup. Please verify your inputs.');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'An error occurred during site setup. Please try again.';
      if (
        errMsg.toLowerCase().includes('already been completed') ||
        errMsg.toLowerCase().includes('already completed')
      ) {
        setGeneralError('Initial setup has already been completed. Redirecting to login page...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      } else {
        setGeneralError(errMsg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Simple Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Initial Website Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Configure your master administrator account and basic store settings to launch your portal.
          </p>
        </div>

        {/* Live Server Status Bar */}
        <div className="mb-6">
          {serverStatus.status === 'online' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    Server Online
                  </span>
                  <span className="text-[11px] text-emerald-700 hidden sm:inline">•</span>
                  <span className="text-[11px] text-emerald-700">
                    Port 8585 {serverStatus.latencyMs !== null ? `(${serverStatus.latencyMs}ms latency)` : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={checkServerHealth}
                disabled={isPinging}
                title="Refresh server status"
                className="p-1 hover:bg-emerald-100 rounded-md text-emerald-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {serverStatus.status === 'checking' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                <span>Checking backend server connection...</span>
              </div>
              <span className="text-[11px] text-slate-500">Port 8585</span>
            </div>
          )}

          {serverStatus.status === 'offline' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <WifiOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-950">Backend Server Unreachable</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{serverStatus.message}</p>
                    <p className="text-[10px] text-rose-600/90 mt-1">
                      Tip: Ensure your backend server is running (<code className="font-mono bg-rose-100/80 px-1 py-0.5 rounded">npm run dev:backend</code> or on port 8585).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={checkServerHealth}
                  disabled={isPinging}
                  className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging...' : 'Retry'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              step === 1
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 1 ? 'bg-white text-slate-900' : 'bg-slate-300 text-slate-800'
              }`}
            >
              1
            </span>
            <span>Administrator Account</span>
          </button>

          <span className="text-slate-300 text-xs">→</span>

          <button
            type="button"
            onClick={(e) => {
              if (step === 1) handleProceedToStep2(e);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              step === 2
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 2 ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span>Store & Shipping</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{generalError}</span>
          </div>
        )}

        {/* Success Confirmation Banner */}
        {setupSuccess && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Setup Completed Successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Superadmin account created. Redirecting to management dashboard...
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Administrator Account Details */}
        {step === 1 && !setupSuccess && (
          <form onSubmit={handleProceedToStep2} className="space-y-4">
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                Step 1: Administrator Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This account will have full master authority over orders, products, and configurations.
              </p>
            </div>

            {/* Name and Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={values.adminName}
                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                    onBlur={() => handleBlur('adminName')}
                    placeholder="e.g. Sajedul Sakib"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.adminName && fieldErrors.adminName
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.adminName && fieldErrors.adminName && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.adminName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Superadmin Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={values.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    onBlur={() => handleBlur('adminEmail')}
                    placeholder="admin@yourdomain.com"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.adminEmail && fieldErrors.adminEmail
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.adminEmail && fieldErrors.adminEmail && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.adminEmail}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Admin Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={values.adminPhone}
                  onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                  onBlur={() => handleBlur('adminPhone')}
                  placeholder="01712345678 or +8801712345678"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                    touched.adminPhone && fieldErrors.adminPhone
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-300 focus:border-slate-800'
                  }`}
                />
              </div>
              {touched.adminPhone && fieldErrors.adminPhone && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.adminPhone}</span>
                </p>
              )}
            </div>

            {/* Passwords Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={values.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-9 pr-9 py-2 rounded-lg text-xs font-mono bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.password && fieldErrors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
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
                {touched.password && fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={values.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Re-enter password"
                    className={`w-full pl-9 pr-9 py-2 rounded-lg text-xs font-mono bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.confirmPassword && fieldErrors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Continue to Store Settings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Store & Shipping Configuration */}
        {step === 2 && !setupSuccess && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-700" />
                Step 2: Store Information & Delivery Rates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up initial branding and customer delivery fees. These can be modified anytime in settings.
              </p>
            </div>

            {/* Store and Site Title Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Store / Brand Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={values.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    onBlur={() => handleBlur('storeName')}
                    placeholder="StoreForge"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.storeName && fieldErrors.storeName
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.storeName && fieldErrors.storeName && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.storeName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Website Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={values.siteTitle}
                    onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                    onBlur={() => handleBlur('siteTitle')}
                    placeholder="StoreForge E-Commerce"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.siteTitle && fieldErrors.siteTitle
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.siteTitle && fieldErrors.siteTitle && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.siteTitle}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Support Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Support Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={values.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    onBlur={() => handleBlur('contactPhone')}
                    placeholder="01712345678"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.contactPhone && fieldErrors.contactPhone
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.contactPhone && fieldErrors.contactPhone && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.contactPhone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Support Contact Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={values.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    onBlur={() => handleBlur('contactEmail')}
                    placeholder="support@storeforge.io"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.contactEmail && fieldErrors.contactEmail
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.contactEmail && fieldErrors.contactEmail && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.contactEmail}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Charges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Inside Dhaka Delivery (৳) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    value={values.deliveryDhaka}
                    onChange={(e) => handleInputChange('deliveryDhaka', e.target.value)}
                    onBlur={() => handleBlur('deliveryDhaka')}
                    placeholder="60"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.deliveryDhaka && fieldErrors.deliveryDhaka
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.deliveryDhaka && fieldErrors.deliveryDhaka && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.deliveryDhaka}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Outside Dhaka Delivery (৳) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    value={values.deliveryOutside}
                    onChange={(e) => handleInputChange('deliveryOutside', e.target.value)}
                    onBlur={() => handleBlur('deliveryOutside')}
                    placeholder="120"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                      touched.deliveryOutside && fieldErrors.deliveryOutside
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-slate-800'
                    }`}
                  />
                </div>
                {touched.deliveryOutside && fieldErrors.deliveryOutside && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.deliveryOutside}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading || serverStatus.status === 'offline'}
                className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Admin & Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup & Launch Dashboard</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminFirstRunSetup;
