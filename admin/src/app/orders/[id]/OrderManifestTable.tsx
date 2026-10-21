'use client';

import React from 'react';
import { Truck } from 'lucide-react';

interface OrderManifestTableProps {
  items: any[];
}

export const OrderManifestTable = React.memo(function OrderManifestTable({ items }: OrderManifestTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#c08a46]" /> Ordered Items Manifest
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Size / Variant</th>
              <th className="p-4 text-center">Unit Price</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items?.map((item: any) => (
              <tr key={item.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.imageUrl ||
                        item.product?.images?.[0]?.imageUrl ||
                        item.product?.images?.[0]?.thumbnailUrl ||
                        '/images/no-image.svg'
                      }
                      alt={item.productName}
                      loading="lazy"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/no-image.svg';
                      }}
                    />
                    <div className="font-bold text-slate-900 text-sm">{item.productName}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {item.sizeName}
                  </span>
                </td>
                <td className="p-4 text-center font-mono">৳{Number(item.unitPrice).toLocaleString()}</td>
                <td className="p-4 text-center font-bold text-slate-900">x{item.quantity}</td>
                <td className="p-4 text-right font-bold text-slate-900">
                  ৳{Number(item.totalPrice).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default OrderManifestTable;
