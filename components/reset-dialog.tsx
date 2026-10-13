"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Modal } from "@/components/ui/modal";

interface ResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetDialog({ isOpen, onClose, onConfirm }: ResetDialogProps) {
  const { t } = useI18n();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[360px]"
      ariaLabelledBy="reset-dialog-title"
      className="pb-5 flex flex-col gap-2.5 text-center"
    >
      {/* Warning Icon Badge */}
      <div className="w-12 h-12 rounded-full bg-[var(--danger-bg)] text-[var(--danger)] flex items-center justify-center self-center">
        <RotateCcw className="w-6 h-6" strokeWidth={2} />
      </div>

      <h2 id="reset-dialog-title" className="mt-1.5 mb-0 text-[19px] font-semibold tracking-tight">
        {t("reset.dialogTitle")}
      </h2>

      <p className="m-0 text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
        {t("reset.dialogDesc")}
      </p>

      {/* Buttons */}
      <div className="flex gap-2.5 mt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-12 rounded-2xl border-0 bg-[var(--bg-subtle)] text-[var(--text-primary)] text-base font-semibold transition-opacity hover:opacity-85 cursor-pointer"
        >
          {t("reset.cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-12 rounded-2xl border-0 bg-[var(--danger)] text-white text-base font-semibold transition-opacity hover:opacity-85 cursor-pointer"
        >
          {t("reset.confirm")}
        </button>
      </div>
    </Modal>
  );
}
