import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Nghe chép — Audio Dictation Player",
    template: "%s | Nghe chép",
  },
  description:
    "Trình phát audio chuyên dụng cho luyện nghe chép chính tả (dictation, ETS TOEIC). Hoạt động 100% offline, lặp câu linh hoạt, khoảng nghỉ chép bài và hệ thống phím tắt toàn diện.",
  keywords: [
    "nghe chép chính tả",
    "dictation",
    "audio dictation player",
    "luyện nghe toeic",
    "ets toeic",
    "luyện nghe tiếng anh",
    "học tiếng anh",
    "lặp câu audio",
    "chép chính tả tiếng anh",
  ],
  authors: [{ name: "Nghe chép" }],
  creator: "Nghe chép",
  publisher: "Nghe chép",
  applicationName: "Nghe chép",
  category: "Education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Nghe chép — Audio Dictation Player",
    description:
      "Trình phát audio chuyên dụng cho luyện nghe chép chính tả (dictation, ETS TOEIC). Hoạt động 100% offline, lặp câu linh hoạt, khoảng nghỉ chép bài và hệ thống phím tắt toàn diện.",
    type: "website",
    locale: "vi_VN",
    alternateLocale: ["en_US"],
    siteName: "Nghe chép",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nghe chép — Audio Dictation Player",
    description:
      "Trình phát audio chuyên dụng cho luyện nghe chép chính tả (dictation, ETS TOEIC). Hoạt động 100% offline, lặp câu linh hoạt và phím tắt thông minh.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Nghe chép — Audio Dictation Player",
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  browserRequirements: "Requires HTML5 Audio and JavaScript.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "VND",
  },
  description:
    "Trình phát audio chuyên dụng cho việc luyện nghe chép chính tả (dictation, ETS TOEIC). Chạy 100% offline trên thiết bị với vòng lặp và phím tắt thông minh.",
  featureList: [
    "Lặp câu N lần tự động",
    "Khoảng nghỉ X giây chép bài",
    "Tua bước nhảy tùy chỉnh",
    "Hệ thống phím tắt toàn diện",
    "Đánh dấu đã nghe và gắn sao",
    "Chạy 100% offline trên trình duyệt",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
