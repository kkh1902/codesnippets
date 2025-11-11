import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";

export const metadata: Metadata = {
  title: "Code Snippets - 학습 노트",
  description: "개인 코드 스니펫 & 학습 노트 저장소",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
