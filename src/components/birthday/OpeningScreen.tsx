import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";

export function OpeningScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.section
      key="opening"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-purple/80"
      >
        <Sparkles className="h-4 w-4" /> A little surprise <Sparkles className="h-4 w-4" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4 }}
        className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
      >
        <span className="text-gradient">Happy Birthday</span>
        <br />
        <span className="font-script text-6xl text-primary sm:text-8xl md:text-9xl">
          Gayatri
        </span>{" "}
        <span className="inline-block">❤️</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-8 max-w-xl text-base text-muted-foreground sm:text-lg"
      >
        A special gift made with love by your brother,{" "}
        <span className="font-semibold text-secondary">Teja</span>.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpen}
        className="group relative mt-12 overflow-hidden rounded-full px-10 py-5 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] sm:text-lg"
        style={{ background: "var(--gradient-primary)" }}
      >
        <span className="relative z-10 flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Open Card
        </span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 1, delay: 1.8 },
          y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-10 flex items-center gap-2 text-sm text-purple/90 sm:text-base"
      >
        🎁 Click here to open your present
      </motion.div>
    </motion.section>
  );
}