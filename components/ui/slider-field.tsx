"use client";

import React from "react";

interface SliderFieldProps {
  label: string;
  min: number;
  max: number;
  value: number;
  displayValue: React.ReactNode;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function SliderField({
  label,
  min,
  max,
  value,
  displayValue,
  onChange,
  icon,
  ariaLabel,
  className = "flex-[1_1_200px]",
}: SliderFieldProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2.5 h-10 text-[var(--text-primary)]">
        {icon}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={ariaLabel || label}
          className="flex-1 min-w-0 accent-[var(--slider-accent)] cursor-pointer"
        />
        <span className="w-12 text-right text-[13px] tabular-nums text-[var(--text-secondary)] font-medium">
          {displayValue}
        </span>
      </div>
    </div>
  );
}
