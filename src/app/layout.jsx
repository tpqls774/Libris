import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Libris - 나만의 독서 관리",
  description: "개인 독서 관리 및 독서 통계 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f9f9fa] text-[#22223b]`}
      >
        <NotificationBadgeUpdater />
        {children}
      </body>
    </html>
  );
}
