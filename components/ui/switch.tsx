"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
  disabled = false,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      aria-label={ariaLabel}
      className={`w-[51px] h-[31px] rounded-2xl border-0 p-0.5 flex items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked
          ? "bg-[var(--accent-btn)] justify-end"
          : "bg-[var(--bg-subtle)] border border-[var(--border-input)] justify-start"
      }`}
    >
      <span
        className={`w-[27px] h-[27px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform ${
          checked ? "bg-[var(--accent-btn-text)]" : "bg-white"
        }`}
      />
    </button>
  );
}
