import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivitalk — 3D 비주얼 AI 챗봇 빌더",
  description: "5분이면 충분합니다. 당신의 비즈니스 데이터를 학습한 AI 챗봇을, 코드 한 줄로 어떤 웹사이트에든.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-ink-900 text-ink-50 antialiased">
        {children}
      </body>
    </html>
  );
}
