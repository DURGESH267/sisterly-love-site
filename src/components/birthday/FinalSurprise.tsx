import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Gift, Music, Pause } from "lucide-react";

function fireworks() {
  const duration = 3500;
  const end = Date.now() + duration;
  const colors = ["#f0a8d0", "#b288f3", "#f7d774", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({
    particleCount: 80,
    spread: 360,
    startVelocity: 35,
    scalar: 1.2,
    shapes: ["circle"],
    colors: ["#ff6fa3", "#ff3d7f"],
    origin: { y: 0.5 },
  });
}

export function FinalSurprise() {
  const [opened, setOpened] = useState(false);
  const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const open = () => {
    setOpened(true);
    confetti({ particleCount: 250, spread: 120, origin: { y: 0.6 } });
    setTimeout(fireworks, 400);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (music) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setMusic(!music);
  };

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-10"
              >
                <div
                  className="grid h-44 w-44 place-items-center rounded-2xl text-7xl shadow-[var(--shadow-glow)] sm:h-56 sm:w-56 sm:text-8xl"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  🎁
                </div>
                <div
                  className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2"
                  style={{ background: "var(--gradient-gold)" }}
                />
                <div
                  className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2"
                  style={{ background: "var(--gradient-gold)" }}
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={open}
                className="flex items-center gap-2 rounded-full px-10 py-5 text-lg font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Gift className="h-5 w-5" /> Open Your Present
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="glass-strong rounded-3xl p-10 sm:p-14"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-4xl font-bold sm:text-6xl"
              >
                🎂 <span className="text-gradient">Happy Birthday Gayatri</span> ❤️
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 space-y-4 font-script text-2xl text-foreground/85 sm:text-3xl"
              >
                <p>You deserve all the happiness in the world.</p>
                <p>Thank you for being such an amazing sister.</p>
                <p className="text-secondary">Love, Teja</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={toggleMusic}
                className="glass mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-primary hover:bg-white/70"
              >
                {music ? <Pause className="h-4 w-4" /> : <Music className="h-4 w-4" />}
                {music ? "Pause music" : "Play background music"}
              </motion.button>

              {/* Soft royalty-free birthday tune. Swap src with your own track. */}
              <audio
                ref={audioRef}
                loop
                src="https://cdn.pixabay.com/download/audio/2022/10/30/audio_347111d654.mp3?filename=happy-birthday-piano-music-115845.mp3"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}