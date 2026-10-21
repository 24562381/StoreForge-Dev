'use client';

import React from 'react';

export interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (minVal: number, maxVal: number) => void;
  currency: string;
  formatNum: (n: number | string) => string;
}

export const PriceRangeSlider = React.memo(function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  currency,
  formatNum,
}: PriceRangeSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState<'min' | 'max' | null>(null);

  const span = Math.max(1, max - min);
  const loPercent = Math.max(0, Math.min(100, ((valueMin - min) / span) * 100));
  const hiPercent = Math.max(0, Math.min(100, ((valueMax - min) / span) * 100));

  React.useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (e: PointerEvent | MouseEvent | TouchEvent) => {
      if (!trackRef.current) return;
      const clientX =
        'touches' in e && e.touches.length > 0
          ? e.touches[0].clientX
          : (e as MouseEvent).clientX;

      if (clientX === undefined) return;

      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawVal = Math.round((min + ratio * span) / 50) * 50;

      if (dragging === 'min') {
        const clamped = Math.min(Math.max(rawVal, min), valueMax);
        onChange(clamped, valueMax);
      } else if (dragging === 'max') {
        const clamped = Math.max(Math.min(rawVal, max), valueMin);
        onChange(valueMin, clamped);
      }
    };

    const handlePointerUp = () => {
      setDragging(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragging, min, max, span, valueMin, valueMax, onChange]);

  const handlePointerDown = (
    thumb: 'min' | 'max',
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(thumb);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current || dragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const clickVal = Math.round((min + ratio * span) / 50) * 50;

    const distToMin = Math.abs(clickVal - valueMin);
    const distToMax = Math.abs(clickVal - valueMax);
    if (distToMin <= distToMax) {
      onChange(Math.min(clickVal, valueMax), valueMax);
    } else {
      onChange(valueMin, Math.max(clickVal, valueMin));
    }
  };

  return (
    <div className="price-slider-wrap select-none">
      <div
        ref={trackRef}
        className="price-range-slider relative h-6 flex items-center cursor-pointer touch-none"
        onClick={handleTrackClick}
      >
        {/* Background Track */}
        <div className="price-range-track absolute left-[9px] right-[9px] h-1.5 rounded-full bg-[#e5ddd2]" />

        {/* Highlighted Fill */}
        <div
          className="price-range-fill absolute h-1.5 rounded-full bg-gradient-to-r from-[#8e5a35] to-[#ad6e41] shadow-xs"
          style={{
            left: `calc(9px + (100% - 18px) * ${loPercent / 100})`,
            width: `calc((100% - 18px) * ${Math.max(0, hiPercent - loPercent) / 100})`,
          }}
        />

        {/* Left (Min) Thumb */}
        <div
          role="slider"
          aria-valuenow={valueMin}
          aria-valuemin={min}
          aria-valuemax={valueMax}
          aria-label="Minimum Price"
          tabIndex={0}
          onPointerDown={(e) => handlePointerDown('min', e)}
          onTouchStart={(e) => handlePointerDown('min', e)}
          onMouseDown={(e) => handlePointerDown('min', e)}
          className="absolute w-[18px] h-[18px] -ml-[9px] rounded-full bg-white border-[3px] border-[#8e5a35] shadow-md cursor-grab active:cursor-grabbing active:scale-125 transition-transform hover:scale-110"
          style={{
            left: `calc(9px + (100% - 18px) * ${loPercent / 100})`,
            zIndex: dragging === 'min' ? 30 : 15,
          }}
        />

        {/* Right (Max) Thumb */}
        <div
          role="slider"
          aria-valuenow={valueMax}
          aria-valuemin={valueMin}
          aria-valuemax={max}
          aria-label="Maximum Price"
          tabIndex={0}
          onPointerDown={(e) => handlePointerDown('max', e)}
          onTouchStart={(e) => handlePointerDown('max', e)}
          onMouseDown={(e) => handlePointerDown('max', e)}
          className="absolute w-[18px] h-[18px] -ml-[9px] rounded-full bg-white border-[3px] border-[#8e5a35] shadow-md cursor-grab active:cursor-grabbing active:scale-125 transition-transform hover:scale-110"
          style={{
            left: `calc(9px + (100% - 18px) * ${hiPercent / 100})`,
            zIndex: dragging === 'max' ? 30 : 20,
          }}
        />
      </div>

      {/* Bound Labels */}
      <div className="price-range-labels flex justify-between items-center mt-1">
        <span className="price-bound-pill text-[11px] font-bold text-[#7b6f63] bg-[#efe7dc] px-2 py-0.5 rounded-md">
          {currency}
          {formatNum(min)}
        </span>
        <span className="price-bound-pill text-[11px] font-bold text-[#7b6f63] bg-[#efe7dc] px-2 py-0.5 rounded-md">
          {currency}
          {formatNum(max)}
        </span>
      </div>
    </div>
  );
});
