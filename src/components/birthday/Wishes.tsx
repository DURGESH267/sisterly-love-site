import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const wishes = [
  "May all your dreams come true.",
  "May happiness follow you everywhere.",
  "May this year be your best year yet.",
  "Keep smiling and shining.",
];

export function Wishes() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    const current = wishes[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setPhase("holding"), 1600);
      }
    } else if (phase === "holding") {
      timeout = setTimeout(() => setPhase("deleting"), 800);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 25);
      } else {
        setIdx((i) => (i + 1) % wishes.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, idx]);

  return (
    <section className="relative z-10 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong mx-auto max-w-3xl rounded-3xl p-10 text-center sm:p-14"
      >
        <h2 className="font-display text-4xl font-bold sm:text-5xl">
          ✨ <span className="text-gradient">Birthday Wishes</span>
        </h2>
        <p className="mt-8 min-h-[3.5rem] font-script text-3xl text-primary sm:text-4xl">
          {text}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="ml-1 inline-block"
          >
            |
          </motion.span>
        </p>
      </motion.div>
    </section>
  );
}