import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nghe chép — Audio Dictation Player",
  description: "Trình phát audio cho nghe chép chính tả — Chạy offline, lặp câu, phím tắt linh hoạt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
