'use client';

import React, { useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { BkashSimulatorCard } from './BkashSimulatorCard';

function BkashSimulatorContent() {
  const searchParams = useSearchParams();
  const paymentID = searchParams.get('paymentID') || 'TR0011g1743141883391';
  const amount = searchParams.get('amount') || '4580';
  const order = searchParams.get('order') || '#WM000101';
  const callbackURL = searchParams.get('callbackURL') || '/api/payment/bkash/callback';

  const [wallet, setWallet] = useState('01700000000');
  const [pin, setPin] = useState('12345');
  const [loading, setLoading] = useState(false);

  const handleSimulateAction = useCallback(
    (status: 'success' | 'failure' | 'cancel') => {
      setLoading(true);
      let safeCallback = '/api/payment/bkash/callback';
      try {
        const rawUrl = new URL(callbackURL, window.location.origin);
        if (
          rawUrl.origin === window.location.origin &&
          rawUrl.pathname.startsWith('/api/payment/bkash/')
        ) {
          safeCallback = rawUrl.pathname + rawUrl.search;
        }
      } catch {}

      const targetUrl = new URL(safeCallback, window.location.origin);
      targetUrl.searchParams.set('paymentID', paymentID);
      targetUrl.searchParams.set('status', status);
      window.location.href = targetUrl.toString();
    },
    [callbackURL, paymentID],
  );

  return (
    <div className="min-h-screen bg-[#e2136e]/5 flex items-center justify-center p-4">
      <BkashSimulatorCard
        paymentID={paymentID}
        amount={amount}
        order={order}
        wallet={wallet}
        setWallet={setWallet}
        pin={pin}
        setPin={setPin}
        loading={loading}
        onSimulateAction={handleSimulateAction}
      />
    </div>
  );
}

export default function Wrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading simulator...</div>}>
      <BkashSimulatorContent />
    </Suspense>
  );
}
