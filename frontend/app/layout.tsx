import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "게시판",
  description: "FastAPI + Next.js 게시판",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
