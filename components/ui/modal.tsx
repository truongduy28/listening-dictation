"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: string;
  className?: string;
  ariaLabelledBy?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  maxWidth = "max-w-[360px]",
  className = "",
  ariaLabelledBy,
  children,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 box-border transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={`w-full ${maxWidth} bg-[var(--bg-card)] rounded-[24px] p-6 shadow-[var(--shadow-dialog)] border border-[var(--border-card)] transition-transform duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
