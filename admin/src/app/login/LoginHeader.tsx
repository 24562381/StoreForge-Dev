'use client';

import React from 'react';
import { Store } from 'lucide-react';

interface LoginHeaderProps {
  siteTitle?: string;
}

export const LoginHeader = React.memo(function LoginHeader({ siteTitle }: LoginHeaderProps) {
  return (
    <div className="text-center space-y-1.5 mb-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 mb-2">
        <Store className="w-6 h-6" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {siteTitle ? `${siteTitle} Administration` : 'StoreForge Administration'}
      </h1>
      <p className="text-xs text-slate-500 max-w-xs mx-auto">
        Sign in with your administrator credentials to access the management portal.
      </p>
    </div>
  );
});

export default LoginHeader;
