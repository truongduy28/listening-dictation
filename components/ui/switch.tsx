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
      className={`w-[51px] h-[31px] rounded-full p-[2px] flex items-center transition-colors duration-200 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked
          ? "bg-[var(--accent-btn)]"
          : "bg-[var(--bg-subtle)] border border-[var(--border-input)]"
      }`}
    >
      <span
        className={`w-[25px] h-[25px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${
          checked ? "translate-x-5 bg-[var(--accent-btn-text)]" : "translate-x-0.5 bg-white"
        }`}
      />
    </button>
  );
}
