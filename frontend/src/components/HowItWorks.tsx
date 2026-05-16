"use client";
import { motion } from "framer-motion";

const STEPS = [
  { n: "01", title: "회원가입", desc: "이메일 한 번이면 끝. 신용카드 없이 무료로 시작." },
  { n: "02", title: "데이터 업로드", desc: "PDF, 매뉴얼, FAQ. 드래그 앤 드롭하면 자동으로 청킹/임베딩." },
  { n: "03", title: "스타일 설정", desc: "이름, 색상, 환영 메시지. 브랜드에 맞춰 한 화면에서 끝." },
  { n: "04", title: "임베드", desc: "발급된 <script> 태그 한 줄을 사이트 <head>에 붙여 넣기." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-50/70">동작 원리</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight">4단계로 끝나는 출시</h2>
        </div>
        <div className="relative grid md:grid-cols-4 gap-6">
          <div className="hidden md:block absolute top-9 left-12 right-12 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-600 grid place-items-center font-bold text-lg mx-auto shadow-xl shadow-brand-900/40">
                {s.n}
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-50/70">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 mx-auto max-w-3xl glass rounded-3xl p-6"
        >
          <div className="text-xs uppercase tracking-widest text-ink-50/50 mb-3">샘플 임베드 코드</div>
          <pre className="overflow-x-auto text-sm text-emerald-300 bg-black/40 rounded-2xl p-5 font-mono">
{`<script
  src="https://api.vivitalk.io/widget.js"
  data-chatbot-id="YOUR_BOT_ID"
  data-api="https://api.vivitalk.io"
  defer
></script>`}
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
