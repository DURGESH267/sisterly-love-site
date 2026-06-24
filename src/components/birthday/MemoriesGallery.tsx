import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, Sparkles } from "lucide-react";
import gayatriMosaic from "@/assets/gayatri-mosaic.png.asset.json";

// ============================================================
// PHOTO MOSAIC — a giant portrait built from many small photos.
// Swap `tilePhotos` entries with real family photos when ready,
// and replace `portraitSrc` with the hero portrait you want
// revealed when the slider is pulled to the right.
// ============================================================

// Placeholder animal photos (replace with real memories later)
const tilePhotos: string[] = [
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=70", // cat
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=70", // dog
  "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=70", // squirrel
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=70", // cat 2
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=70", // panda
  "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&q=70", // kitten
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=70", // puppy
  "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&q=70", // rabbit
  "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&q=70", // fox
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=70", // bear
  "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400&q=70", // owl
  "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=70", // squirrel 2
];

const portraitSrc = gayatriMosaic.url;

// Grid size — 8 columns × 10 rows = 80 tiles forming the portrait
const COLS = 8;
const ROWS = 10;
const TILE_COUNT = COLS * ROWS;

export function MemoriesGallery() {
  const [active, setActive] = useState<number | null>(null);
  const [reveal, setReveal] = useState(0); // 0 = individual tiles, 100 = full portrait

  // Stable random order so tiles assemble in a non-linear sweep
  const tileOrder = useMemo(() => {
    const arr = Array.from({ length: TILE_COUNT }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((Math.sin(i * 9.137) * 0.5 + 0.5) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Floating sparkles around the mosaic frame
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        size: 10 + Math.random() * 14,
      })),
    [],
  );

  return (
    <section className="relative z-10 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-4xl font-bold sm:text-5xl"
        >
          📸 <span className="text-gradient">Memories That Made You</span>
        </motion.h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          A portrait built from many little memories — every tile, a moment that
          shaped the person you are today.
        </p>

        {/* Mosaic frame */}
        <div className="relative mt-12">
          {/* Floating sparkles */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                className="absolute text-secondary"
                style={{ top: `${s.top}%`, left: `${s.left}%` }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6], rotate: [0, 180, 360] }}
                transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }}
              >
                <Sparkles style={{ width: s.size, height: s.size }} />
              </motion.div>
            ))}
          </div>

          {/* Glassmorphism frame */}
          <div
            className="glass-strong relative rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_-10px_rgba(236,72,153,0.45)] ring-1 ring-white/40"
            style={{ boxShadow: "0 0 80px -10px rgba(217,70,239,0.35), inset 0 0 30px rgba(255,255,255,0.25)" }}
          >
            <div
              className="relative mx-auto aspect-[4/5] w-full max-w-[640px] overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100/40 to-purple-100/40"
            >
              {/* Tile grid (the small photos) */}
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  gap: "2px",
                }}
              >
                {Array.from({ length: TILE_COUNT }).map((_, i) => {
                  const photoIndex = i % tilePhotos.length;
                  const assembleDelay = tileOrder.indexOf(i) * 0.012;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.5, delay: assembleDelay, ease: "easeOut" }}
                      whileHover={{ scale: 1.35, zIndex: 30, transition: { duration: 0.25 } }}
                      onClick={() => setActive(photoIndex)}
                      className="relative overflow-hidden rounded-[3px] focus:outline-none focus:ring-2 focus:ring-secondary"
                      aria-label={`Memory photo ${i + 1}`}
                    >
                      <img
                        src={tilePhotos[photoIndex]}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </motion.button>
                  );
                })}
              </div>

              {/* Portrait overlay — opacity controlled by slider */}
              <motion.img
                src={portraitSrc}
                alt="A portrait of Gayatri assembled from memories"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-normal"
                style={{ opacity: reveal / 100 }}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            {/* Slider: individual photos ↔ portrait */}
            <div className="mx-auto mt-6 max-w-xl px-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Individual photos</span>
                <span>Full portrait</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={reveal}
                onChange={(e) => setReveal(Number(e.target.value))}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-amber-300 accent-primary"
                aria-label="Reveal portrait"
              />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center font-script text-2xl text-primary sm:text-3xl">
          "Every memory is a small piece of the beautiful person you are today. ❤️"
        </p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-2xl rounded-2xl p-4 sm:p-6"
            >
              <img
                src={tilePhotos[active]}
                alt="Memory"
                className="max-h-[70vh] w-full rounded-xl object-cover"
              />
              <button
                onClick={() => setActive(null)}
                className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}