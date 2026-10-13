"use client";

import React from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit: string;
  onChange: (value: number) => void;
  ariaLabel?: string;
  className?: string;
}

export function NumberField({
  label,
  value,
  min = 0,
  max = 99,
  unit,
  onChange,
  ariaLabel,
  className = "flex-[1_1_150px]",
}: NumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const clamped = isNaN(raw) ? min : Math.max(min, Math.min(max, raw));
    onChange(clamped);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
        {label}
      </span>
      <div className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Giảm ${label}`}
          className="w-8 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center text-base font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          aria-label={ariaLabel || label}
          className="w-14 h-10 box-border text-center border border-[var(--border-input)] rounded-xl bg-[var(--bg-card)] font-inherit text-base font-semibold tabular-nums text-[var(--text-primary)] focus:border-[var(--accent-btn)] transition-colors"
        />
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Tăng ${label}`}
          className="w-8 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center text-base font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
        >
          +
        </button>
        <span className="ml-1 text-[13px] font-medium">{unit}</span>
      </div>
    </div>
  );
}
