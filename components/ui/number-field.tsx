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
      <label className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          aria-label={ariaLabel || label}
          className="w-16 h-10 box-border text-center border border-[var(--border-input)] rounded-xl bg-[var(--bg-card)] font-inherit text-base font-semibold tabular-nums text-[var(--text-primary)]"
        />
        <span>{unit}</span>
      </label>
    </div>
  );
}
