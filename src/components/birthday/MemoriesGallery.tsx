import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

// ============================================================
// MEMORIES — replace `src` with real photos when ready.
// Keep the array length, captions, and categories the same shape.
// ============================================================
type Memory = { src: string; caption: string; memory: string; category: string };

const ids = [
  "photo-1543852786-1cf6624b9987",
  "photo-1574144611937-0df059b5ef3e",
  "photo-1425082661705-1834bfd09dca",
  "photo-1583337130417-3346a1be7dee",
  "photo-1591871937573-74dbba515c4c",
  "photo-1444212477490-ca407925329e",
  "photo-1518791841217-8f162f1e1131",
  "photo-1561948955-570b270e7c36",
  "photo-1450778869180-41d0601e046e",
  "photo-1415369629372-26f2fe60c467",
  "photo-1546182990-dffeafbe841d",
  "photo-1437622368342-7a3d73a34c8f",
  "photo-1552053831-71594a27632d",
  "photo-1573865526739-10659fec78a5",
  "photo-1517423440428-a5a00ad493e8",
];

const categories = [
  "Childhood Memories",
  "Family Moments",
  "School Days",
  "Recent Memories",
  "Favorite Moments",
];

const memories: Memory[] = ids.map((id, i) => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`,
  caption: `Sweet moment #${i + 1}`,
  memory: "A little snapshot from our story — replace this with a real memory whenever you'd like.",
  category: categories[i % categories.length],
}));

const heights = ["h-56", "h-72", "h-64", "h-80", "h-60"];

export function MemoriesGallery() {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (active === null || !playing) return;
    const t = setInterval(() => {
      setActive((a) => (a === null ? 0 : (a + 1) % memories.length));
    }, 2500);
    return () => clearInterval(t);
  }, [active, playing]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((a) => (a === null ? 0 : (a + 1) % memories.length));
      if (e.key === "ArrowLeft")
        setActive((a) => (a === null ? 0 : (a - 1 + memories.length) % memories.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section className="relative z-10 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-4xl font-bold sm:text-5xl"
        >
          📸 <span className="text-gradient">Our Memories Together</span>
        </motion.h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Tap a polaroid to relive it — or play the slideshow.
        </p>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
          {memories.map((m, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
              whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
              onClick={() => {
                setActive(i);
                setPlaying(false);
              }}
              className="glass block w-full rounded-lg p-3 pb-5 text-left shadow-[var(--shadow-glass)]"
            >
              <div className={`overflow-hidden rounded-md bg-muted ${heights[i % heights.length]}`}>
                <img
                  src={m.src}
                  alt={m.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <p className="mt-3 font-script text-xl text-primary">{m.caption}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {m.category}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

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
              key={active}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-3xl rounded-2xl p-4 sm:p-6"
            >
              <img
                src={memories[active].src}
                alt={memories[active].caption}
                className="max-h-[60vh] w-full rounded-xl object-cover"
              />
              <div className="mt-4 text-center">
                <p className="font-script text-2xl text-primary">{memories[active].caption}</p>
                <p className="mt-1 text-sm text-muted-foreground">{memories[active].memory}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-secondary">
                  {memories[active].category}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() =>
                    setActive((a) =>
                      a === null ? 0 : (a - 1 + memories.length) % memories.length,
                    )
                  }
                  className="glass rounded-full p-3 text-primary hover:bg-white/70"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="glass rounded-full px-4 py-3 text-primary hover:bg-white/70"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={() =>
                    setActive((a) => (a === null ? 0 : (a + 1) % memories.length))
                  }
                  className="glass rounded-full p-3 text-primary hover:bg-white/70"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

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