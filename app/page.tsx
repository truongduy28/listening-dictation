"use client";

import dynamic from "next/dynamic";

const DictationApp = dynamic(() => import("@/components/dictation-app"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-page)] text-[var(--text-muted)] text-sm">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
      <span>Loading...</span>
    </div>
  ),
});

export default function Home() {
  return <DictationApp />;
}
