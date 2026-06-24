import { motion } from "framer-motion";
import { useMemo } from "react";

// Decorative floating hearts + sparkles + soft gradient orbs.
// Replace nothing — purely decorative.
export function FloatingBackground() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 10,
        size: 12 + Math.random() * 20,
        opacity: 0.25 + Math.random() * 0.4,
      })),
    [],
  );
  const sparkles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* gradient orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink/40 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-purple/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-gold/30 blur-3xl" />

      {/* floating hearts */}
      {hearts.map((h) => (
        <motion.div
          key={`h-${h.id}`}
          className="absolute text-pink"
          style={{ left: `${h.left}%`, fontSize: h.size, opacity: h.opacity }}
          initial={{ y: "110vh", rotate: -20 }}
          animate={{ y: "-10vh", rotate: 20 }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❤
        </motion.div>
      ))}

      {/* sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={`s-${s.id}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-gold"
          style={{ left: `${s.left}%`, top: `${s.top}%`, boxShadow: "0 0 12px var(--gold)" }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}