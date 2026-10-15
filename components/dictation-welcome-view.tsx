"use client";

import React, { useState } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { UpdateToast } from "@/components/pwa/update-toast";

interface DictationWelcomeViewProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFolder: () => void;
  isSafari: boolean;
  isLoading: boolean;
  hasUpdate: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function DictationWelcomeView({
  fileInputRef,
  handleFileInputChange,
  openFolder,
  isSafari,
  isLoading,
  hasUpdate,
  applyUpdate,
  dismissUpdate,
}: DictationWelcomeViewProps) {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder inputs
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <WelcomeScreen
        onOpenFolder={openFolder}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isSafari={isSafari}
        isLoading={isLoading}
      />

      <ShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <UpdateToast
        isOpen={hasUpdate}
        onApplyUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />
    </>
  );
}
