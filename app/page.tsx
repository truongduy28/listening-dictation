"use client";

import dynamic from "next/dynamic";

const DictationApp = dynamic(() => import("@/components/dictation-app"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-live="polite"
      className="flex h-screen w-screen items-center justify-center bg-[var(--bg-page)] text-[var(--text-secondary)] text-sm"
    >
      <div
        className="w-5 h-5 border-2 border-[var(--border-default)] border-t-[var(--accent-btn)] rounded-full animate-spin mr-3"
        aria-hidden="true"
      />
      <span>Đang tải ứng dụng…</span>
    </div>
  ),
});

export default function Home() {
  return <DictationApp />;
}
