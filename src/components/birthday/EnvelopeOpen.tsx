import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

// Quick envelope-open animation; fires confetti, then calls onDone.
export function EnvelopeOpen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t1 = setTimeout(() => {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#f0a8d0", "#b288f3", "#f7d774", "#ffffff"],
      });
    }, 900);
    const t2 = setTimeout(onDone, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <motion.div
      key="envelope"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-screen items-center justify-center px-6"
    >
      <div className="relative h-64 w-[22rem] sm:h-80 sm:w-[28rem]" style={{ perspective: "1200px" }}>
        <div
          className="absolute inset-0 rounded-lg shadow-[var(--shadow-elegant)]"
          style={{ background: "linear-gradient(180deg, oklch(0.95 0.05 350), oklch(0.88 0.10 340))" }}
        />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: -120, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
          className="glass-strong absolute inset-x-6 top-6 rounded-md p-6 text-center"
        >
          <p className="font-script text-2xl text-primary">Dear Gayatri…</p>
          <p className="mt-2 text-xs text-muted-foreground">with love, Your Brother</p>
        </motion.div>
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: 180 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute left-0 right-0 top-0 origin-top"
          style={{
            height: "55%",
            transformStyle: "preserve-3d",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: "linear-gradient(180deg, oklch(0.85 0.14 350), oklch(0.72 0.18 340))",
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-lg"
          style={{
            background: "linear-gradient(180deg, oklch(0.90 0.10 340), oklch(0.82 0.14 335))",
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
          }}
        />
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-primary-foreground shadow-lg"
          style={{ background: "var(--gradient-primary)" }}
        >
          ❤
        </motion.div>
      </div>
    </motion.div>
  );
}