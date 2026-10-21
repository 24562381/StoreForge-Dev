'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, User, MapPin, Package, Check, MessageSquare } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const NAME_PRESETS = [
  'Rafiqul Islam',
  'Sadia Rahman',
  'Tanvir Ahmed',
  'Nusrat Jahan',
  'Fahim Chowdhury',
  'Tasnim Akhtar',
  'Kazi Mehedi Hasan',
  'Farhana Yasmin',
];

const LOCATION_PRESETS = [
  'Gulshan, Dhaka',
  'Banani, Dhaka',
  'Uttara, Dhaka',
  'Dhanmondi, Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Mirpur, Dhaka',
];

const REVIEW_TEMPLATES = [
  {
    label: '🏡 Living Room Highlight',
    text: 'Outstanding craftsmanship! The wooden map completely transformed our living room wall. Everyone who visits asks where we got it from. Swift and careful delivery.',
  },
  {
    label: '🪵 Premium Wood Quality',
    text: 'Top quality birch wood and the 3D multi-layers give it so much depth under warm spotlighting. The laser cutting detail on borders and islands is remarkable.',
  },
  {
    label: '🎁 Memorable Gift',
    text: 'Ordered this for my spouse as an anniversary gift. Packaging was remarkably secure and arrived in perfect condition. Truly a masterclass in home decor.',
  },
  {
    label: '⚡ Swift Delivery & Easy Setup',
    text: 'Delivered safely to our doorstep within 24 hours. The included alignment stencil made installation enjoyable and straightforward. Highly recommended!',
  },
];

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showSuccess,
  showError,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [customerName, setCustomerName] = useState('Rafiqul Islam');
  const [location, setLocation] = useState('Gulshan, Dhaka');
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState(
    'Outstanding craftsmanship! The wooden map completely transformed our living room wall. Everyone who visits asks where we got it from.'
  );
  const [isFeatured, setIsFeatured] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Load available active products for selection
  useEffect(() => {
    if (isOpen) {
      fetchApi('/products?status=active&limit=100')
        .then((res) => {
          const prods = res?.products || res?.items || (Array.isArray(res) ? res : []);
          setProducts(prods);
          if (prods.length > 0 && !productId) {
            setProductId(String(prods[0].id));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showError('Please enter a customer name.');
      return;
    }
    if (!reviewText.trim()) {
      showError('Please enter review content.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        customerName: customerName.trim(),
        rating: Number(rating) || 5,
        reviewText: reviewText.trim(),
        location: location.trim() || null,
        isPublished: Boolean(isPublished),
        isFeatured: Boolean(isFeatured),
        sortOrder: Number(sortOrder) || 0,
      };

      if (productId && productId !== 'general') {
        payload.productId = Number(productId);
      }

      await fetchApi('/reviews/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showSuccess('✨ Dummy customer review added successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Add Dummy Product Review
              </h2>
              <p className="text-[11px] text-slate-500">
                Create verified customer testimonials for products or home page
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form with Fixed Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto p-6 space-y-4 text-xs flex-1">
            {/* 1. Target Product */}
            <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-500" /> Target Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#c08a46]"
            >
              <option value="general">★ General Storefront Testimonial (No Specific Product)</option>
              {products.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name} {p.slug ? `(/products/${p.slug})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Customer Name with Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Customer Name *
              </span>
              <span className="text-[10px] text-slate-400">Click a preset below to auto-fill</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rafiqul Islam"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
            {/* Quick Name Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {NAME_PRESETS.map((pName) => (
                <button
                  key={pName}
                  type="button"
                  onClick={() => setCustomerName(pName)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                    customerName === pName
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pName}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Location with Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location / Area
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Gulshan, Dhaka"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
            {/* Quick Location Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {LOCATION_PRESETS.map((pLoc) => (
                <button
                  key={pLoc}
                  type="button"
                  onClick={() => setLocation(pLoc)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                    location === pLoc
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pLoc}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Rating (Star Selector) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Rating ({rating} Stars)
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-600 ml-2">
                {rating === 5
                  ? '⭐⭐⭐⭐⭐ Excellent / Outstanding'
                  : rating === 4
                  ? '⭐⭐⭐⭐ Very Good'
                  : rating === 3
                  ? '⭐⭐⭐ Good'
                  : `${rating} Stars`}
              </span>
            </div>
          </div>

          {/* 5. Review Content & Quick Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Review Testimonial Text *
              </span>
              <span className="text-[10px] text-slate-400">Click template below to load</span>
            </label>
            <textarea
              rows={3}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write the customer's testimonial..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
            {/* Quick Review Text Templates */}
            <div className="space-y-1 mt-1.5">
              <span className="text-[10px] font-bold text-slate-500 block">✨ Quick Preset Templates:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {REVIEW_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewText(tmpl.text)}
                    className="text-left p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-200 transition-colors text-[10px] text-slate-700 leading-tight"
                  >
                    <span className="font-bold text-[#c08a46] block">{tmpl.label}</span>
                    <span className="text-slate-500 line-clamp-1">{tmpl.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Publication and Display Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-sm focus:ring-[#c08a46]"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Feature on Home</span>
                <span className="text-[10px] text-slate-500">Show on homepage</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Publish Live</span>
                <span className="text-[10px] text-slate-500">Visible on store</span>
              </div>
            </label>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          </div>
          </div>

          {/* Fixed Modal Footer Toolbar */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving Review...' : 'Save & Publish Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
