"use client";

import React from "react";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  variant?: "segment" | "pill";
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  variant = "segment",
}: SegmentedControlProps<T>) {
  if (variant === "pill") {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`pill-btn flex-1 h-10 rounded-xl text-sm font-semibold tabular-nums cursor-pointer ${
                isSelected ? "on" : ""
              } ${buttonClassName}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex bg-[var(--bg-seg-container)] rounded-[10px] p-0.5 gap-0.5 ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`seg-btn flex-1 h-[30px] rounded-lg text-[12.5px] font-medium px-1 ${
              isSelected ? "on" : ""
            } ${buttonClassName}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
