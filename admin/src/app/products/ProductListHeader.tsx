'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAdminPrefix } from '@/lib/useAdminPrefix';

export const ProductListHeader = React.memo(function ProductListHeader() {
  const prefix = useAdminPrefix();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage 3D wooden maps, variants, dimensions, pricing, and AI-generated copy
        </p>
      </div>
      <Link
        href={`${prefix}/products/add`}
        className="px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Add New Product</span>
      </Link>
    </div>
  );
});
