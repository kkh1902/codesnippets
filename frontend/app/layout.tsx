import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import { CategoryTree } from "@/types/category";

export const metadata: Metadata = {
  title: "Code Snippets - 학습 노트",
  description: "개인 코드 스니펫 & 학습 노트 저장소",
};

async function getCategories(): Promise<CategoryTree[]> {
  try {
    const res = await fetch("http://localhost:8000/api/categories/tree", {
      next: { revalidate: 60 },
    });
    return res.json();
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        <LayoutClient initialCategories={categories}>{children}</LayoutClient>
      </body>
    </html>
  );
}
