"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function WidgetTestPage({ params }: { params: { id: string } }) {
  const [backend, setBackend] = useState("http://localhost:8000");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBackend(`${window.location.protocol}//${window.location.hostname}:8000`);
    }
  }, []);
  return (
    <main className="min-h-screen bg-white text-gray-900 p-10">
      <h1 className="text-3xl font-bold">Vivitalk 위젯 테스트 페이지</h1>
      <p className="mt-2 text-gray-600">이 페이지는 외부 웹사이트를 가상한 페이지입니다. 우측 하단의 채팅 버블이 위젯입니다.</p>
      <p className="mt-6 text-sm text-gray-500">챗봇 ID: <code className="px-2 py-1 bg-gray-100 rounded">{params.id}</code></p>
      <Script
        src={`${backend}/widget.js`}
        data-chatbot-id={params.id}
        data-api={backend}
        strategy="afterInteractive"
      />
    </main>
  );
}
