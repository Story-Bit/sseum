import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { BlogProvider } from "@/components/BlogContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "씀. - AI 기반 콘텐츠 창작 플랫폼",
  description: "AI와 함께 생각의 초고를 만들고, 발전시키고, 발행하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <BlogProvider>
            {children}
          </BlogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}