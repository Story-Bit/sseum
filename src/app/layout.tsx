import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "씀(Sseum) - AI 콘텐츠 창작소",
  description: "AI와 함께 이기는 콘텐츠를 제련하세요.",
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
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}