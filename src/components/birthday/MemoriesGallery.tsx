import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ===== REAL PHOTOS =====
import photoComic from "@/assets/photos/ChatGPT_Image_Jun_25_2026_08_36_28_PM.png.asset.json";
import photoMosaicOld from "@/assets/photos/Screenshot_2026-06-24_220920.png.asset.json";
import photoFramed from "@/assets/photos/Screenshot_2026-06-25_202554.png.asset.json";
import photoChildhood from "@/assets/photos/Screenshot_2026-06-25_202627.png.asset.json";
import photoHearts from "@/assets/photos/WhatsApp_Image_2026-06-25_at_11.42.53_AM.jpeg.asset.json";
import photoWhiteDress from "@/assets/photos/WhatsApp_Image_2026-06-25_at_11.42.57_AM.jpeg.asset.json";
import photoTeal from "@/assets/photos/WhatsApp_Image_2026-06-25_at_11.46.03_AM.jpeg.asset.json";
import photoSareePortrait from "@/assets/photos/WhatsApp_Image_2026-06-25_at_11.46.13_AM.jpeg.asset.json";
import photoPurpleCutie from "@/assets/photos/WhatsApp_Image_2026-06-25_at_11.46.51_AM.jpeg.asset.json";
import photoQueen from "@/assets/photos/a_A_birthday_queen_sit.png.asset.json";

type Photo = { src: string; caption: string };

// Childhood-leaning photos for LEFT mosaic
const CHILDHOOD_TILES: string[] = [
  photoChildhood.url,
  photoFramed.url,
  photoHearts.url,
  photoPurpleCutie.url,
  photoQueen.url,
  photoComic.url,
];

// Present-day photos for RIGHT mosaic
const PRESENT_TILES: string[] = [
  photoSareePortrait.url,
  photoWhiteDress.url,
  photoTeal.url,
  photoHearts.url,
  photoFramed.url,
  photoMosaicOld.url,
  photoPurpleCutie.url,
  photoQueen.url,
];

// Portraits the mosaics are built TOWARDS
const CHILDHOOD_PORTRAIT = photoChildhood.url;
const PRESENT_PORTRAIT = photoSareePortrait.url;

// Masonry gallery list
const PHOTOS: Photo[] = [
  { src: photoSareePortrait.url, caption: "Royal saree day ✨" },
  { src: photoWhiteDress.url, caption: "Floral grace 🌸" },
  { src: photoTeal.url, caption: "Standing tall — pure elegance" },
  { src: photoHearts.url, caption: "Sparkles & hearts 💖" },
  { src: photoPurpleCutie.url, caption: "Hey cutie 💜" },
  { src: photoFramed.url, caption: "Good vibes only" },
  { src: photoChildhood.url, caption: "Little you 🌷" },
  { src: photoQueen.url, caption: "Our Birthday Queen 👑" },
  { src: photoComic.url, caption: "Pop-art Happy Birthday 🎉" },
  { src: photoMosaicOld.url, caption: "A piece of the story" },
];

const COLS = 50;
const ROWS = 65;
const TILE_PX = 22;

type Tile = { img: HTMLImageElement; avg: [number, number, number]; src: string };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function avgColor(ctx: CanvasRenderingContext2D, w: number, h: number): [number, number, number] {
  const { data } = ctx.getImageData(0, 0, w, h);
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
  return [r / n, g / n, b / n];
}

// ============================================================
// Single mosaic instance (reused for THEN and NOW)
// ============================================================
function Mosaic({
  portraitSrc,
  tileSrcs,
  flip = false,
  glowColor,
}: {
  portraitSrc: string;
  tileSrcs: string[];
  flip?: boolean;
  glowColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tileMapRef = useRef<{ srcIdx: number; cx: number; cy: number }[]>([]);
  const tilesRef = useRef<Tile[]>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [hover, setHover] = useState<{ col: number; row: number; src: string; px: number; py: number } | null>(null);

  const MOSAIC_W = COLS * TILE_PX;
  const MOSAIC_H = ROWS * TILE_PX;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const portrait = await loadImage(portraitSrc);
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = COLS; sampleCanvas.height = ROWS;
      const sctx = sampleCanvas.getContext("2d")!;
      sctx.drawImage(portrait, 0, 0, COLS, ROWS);
      const targetData = sctx.getImageData(0, 0, COLS, ROWS).data;

      const tileImgs = await Promise.all(tileSrcs.map((s) => loadImage(s).catch(() => null)));
      const tc = document.createElement("canvas"); tc.width = 32; tc.height = 32;
      const tctx = tc.getContext("2d", { willReadFrequently: true })!;
      const tiles: Tile[] = [];
      tileImgs.forEach((img, i) => {
        if (!img) return;
        tctx.clearRect(0, 0, 32, 32);
        tctx.drawImage(img, 0, 0, 32, 32);
        tiles.push({ img, avg: avgColor(tctx, 32, 32), src: tileSrcs[i] });
      });
      if (cancelled || tiles.length === 0) return;
      tilesRef.current = tiles;

      const map: { srcIdx: number; cx: number; cy: number }[] = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = (row * COLS + col) * 4;
          const tr = targetData[i], tg = targetData[i+1], tb = targetData[i+2];
          let best = 0, bestD = Infinity;
          for (let t = 0; t < tiles.length; t++) {
            const [ar, ag, ab] = tiles[t].avg;
            const d = (ar - tr) ** 2 + (ag - tg) ** 2 + (ab - tb) ** 2;
            if (d < bestD) { bestD = d; best = t; }
          }
          map.push({ srcIdx: best, cx: col, cy: row });
        }
      }
      tileMapRef.current = map;

      const canvas = canvasRef.current!;
      canvas.width = MOSAIC_W; canvas.height = MOSAIC_H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1a0a1f"; ctx.fillRect(0, 0, MOSAIC_W, MOSAIC_H);

      const order = map.map((_, i) => i).sort(() => Math.random() - 0.5);
      const CHUNK = Math.ceil(order.length / 30);
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        const end = Math.min(order.length, i + CHUNK);
        for (; i < end; i++) {
          const cell = map[order[i]];
          const tile = tiles[cell.srcIdx];
          const x = cell.cx * TILE_PX, y = cell.cy * TILE_PX;
          ctx.drawImage(tile.img, x, y, TILE_PX, TILE_PX);
          const idx = (cell.cy * COLS + cell.cx) * 4;
          const tr = targetData[idx], tg = targetData[idx+1], tb = targetData[idx+2];
          ctx.fillStyle = `rgba(${tr|0},${tg|0},${tb|0},0.5)`;
          ctx.fillRect(x, y, TILE_PX, TILE_PX);
        }
        setProgress(i / order.length);
        if (i < order.length) requestAnimationFrame(tick);
        else setReady(true);
      };
      requestAnimationFrame(tick);
    })().catch((e) => console.error("Mosaic build failed", e));
    return () => { cancelled = true; };
  }, [portraitSrc, tileSrcs, MOSAIC_W, MOSAIC_H]);

  // wheel zoom
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      setTransform((t) => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const newScale = Math.min(8, Math.max(1, t.scale * factor));
        const ratio = newScale / t.scale;
        return { scale: newScale, x: mx - (mx - t.x) * ratio, y: my - (my - t.y) * ratio };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale: transform.scale };
    } else if (e.touches.length === 1) {
      dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: transform.x, ty: transform.y };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const newScale = Math.min(8, Math.max(1, pinchRef.current.scale * (dist / pinchRef.current.dist)));
      setTransform((t) => ({ ...t, scale: newScale }));
    } else if (e.touches.length === 1 && dragRef.current) {
      const dx = e.touches[0].clientX - dragRef.current.x;
      const dy = e.touches[0].clientY - dragRef.current.y;
      setTransform((t) => ({ ...t, x: dragRef.current!.tx + dx, y: dragRef.current!.ty + dy }));
    }
  };
  const onTouchEnd = () => { pinchRef.current = null; dragRef.current = null; };

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current && (e.buttons & 1)) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      setTransform((t) => ({ ...t, x: dragRef.current!.tx + dx, y: dragRef.current!.ty + dy }));
      return;
    }
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap || !ready) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { setHover(null); return; }
    // account for flip
    const colRaw = Math.floor((x / rect.width) * COLS);
    const col = flip ? (COLS - 1 - colRaw) : colRaw;
    const row = Math.floor((y / rect.height) * ROWS);
    const cell = tileMapRef.current[row * COLS + col];
    if (!cell) return;
    const tile = tilesRef.current[cell.srcIdx];
    const wrect = wrap.getBoundingClientRect();
    setHover({ col: colRaw, row, src: tile.src, px: e.clientX - wrect.left, py: e.clientY - wrect.top });
  };
  const onMouseUp = () => { dragRef.current = null; };
  const onMouseLeave = () => { dragRef.current = null; setHover(null); };

  const resetView = () => setTransform({ scale: 1, x: 0, y: 0 });

  return (
    <div className="relative w-full">
      <div
        ref={wrapRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative mx-auto rounded-3xl p-2 sm:p-4 glass-strong border border-white/20"
        style={{
          touchAction: "none",
          cursor: transform.scale > 1 ? "grab" : "zoom-in",
          boxShadow: `0 0 80px -10px ${glowColor}`,
        }}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-black/40"
          style={{ aspectRatio: `${COLS} / ${ROWS}` }}
        >
          <div
            className="absolute inset-0 origin-top-left will-change-transform"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) ${flip ? "scaleX(-1)" : ""}`,
              transformOrigin: flip ? "center" : "top left",
            }}
          >
            <canvas
              ref={canvasRef}
              className="block w-full h-full select-none"
              style={{ imageRendering: transform.scale > 2 ? "pixelated" : "auto" }}
            />
            {hover && ready && (
              <div
                className="pointer-events-none absolute border-2 border-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]"
                style={{
                  left: `${((flip ? COLS - 1 - hover.col : hover.col) / COLS) * 100}%`,
                  top: `${(hover.row / ROWS) * 100}%`,
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                }}
              />
            )}
          </div>
          {hover && ready && (
            <div
              className="pointer-events-none absolute z-20 rounded-xl overflow-hidden border border-white/40 shadow-2xl bg-black/60 backdrop-blur"
              style={{
                left: Math.min(hover.px + 16, (wrapRef.current?.clientWidth ?? 0) - 120),
                top: Math.min(hover.py + 16, (wrapRef.current?.clientHeight ?? 0) - 120),
                width: 110,
                height: 110,
              }}
            >
              <img src={hover.src} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          {!ready && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-white/90 font-display text-sm mb-3">
                Assembling… {Math.round(progress * 100)}%
              </div>
              <div className="w-40 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-amber-300 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-foreground/70">
          <button
            onClick={() => setTransform((t) => ({ ...t, scale: Math.max(1, t.scale / 1.4) }))}
            className="px-2.5 py-1 rounded-full glass hover:bg-white/20 transition"
          >−</button>
          <span className="tabular-nums w-12 text-center">{transform.scale.toFixed(2)}×</span>
          <button
            onClick={() => setTransform((t) => ({ ...t, scale: Math.min(8, t.scale * 1.4) }))}
            className="px-2.5 py-1 rounded-full glass hover:bg-white/20 transition"
          >+</button>
          <button onClick={resetView} className="px-2.5 py-1 rounded-full glass hover:bg-white/20 transition">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Section
// ============================================================
export function MemoriesGallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeLightbox = () => setLightbox(null);
  const next = () => setLightbox((i) => (i === null ? i : (i + 1) % PHOTOS.length));
  const prev = () => setLightbox((i) => (i === null ? i : (i - 1 + PHOTOS.length) % PHOTOS.length));

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const sparkles = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 3,
    })),
    [],
  );

  return (
    <section id="mosaic" className="relative py-20 sm:py-28 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl text-gradient mb-4"
        >
          📸 Memories That Made You
        </motion.h2>
        <p className="text-foreground/70 max-w-2xl mx-auto text-sm sm:text-base">
          A little gallery of you, and two giant mosaics built from the very same memories.
        </p>
      </div>

      {/* MASONRY GALLERY */}
      <div className="max-w-6xl mx-auto mb-20 sm:mb-28 columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
        {PHOTOS.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
            className="group relative mb-3 sm:mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl glass-strong border border-white/20 shadow-lg hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.6)] transition-all duration-500"
          >
            <img
              src={p.src}
              alt={p.caption}
              loading="lazy"
              decoding="async"
              className="block w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-left translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="text-white text-xs sm:text-sm font-medium drop-shadow">{p.caption}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button type="button" onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition" aria-label="Close">×</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition" aria-label="Previous">‹</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition" aria-label="Next">›</button>
            <AnimatePresence mode="wait">
              <motion.div
                key={lightbox}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={PHOTOS[lightbox].src} alt={PHOTOS[lightbox].caption} className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl" />
                <p className="mt-4 text-white/90 font-script text-xl sm:text-2xl text-center">
                  {PHOTOS[lightbox].caption}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ THE MOSAIC — Then & Now ============ */}
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h3 className="font-display text-2xl sm:text-3xl text-gradient mb-2">The Mosaic</h3>
        <p className="text-foreground/60 text-xs sm:text-sm">
          Two portraits, made of memories. Hover any tile · scroll or pinch to zoom.
        </p>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Floating sparkles */}
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="pointer-events-none absolute text-yellow-300/70 z-10"
            style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6], rotate: [0, 180] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-4 items-center">
          {/* LEFT — Childhood (faces right toward center) */}
          <div className="flex flex-col items-center">
            <Mosaic
              portraitSrc={CHILDHOOD_PORTRAIT}
              tileSrcs={CHILDHOOD_TILES}
              flip
              glowColor="rgba(244,114,182,0.55)"
            />
            <p className="mt-3 font-script text-xl sm:text-2xl text-gradient">Childhood Gayatri</p>
          </div>

          {/* CENTER — THEN ❤ NOW */}
          <div className="flex md:flex-col items-center justify-center gap-2 md:gap-3 md:py-8 select-none">
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="font-display text-lg sm:text-xl md:text-2xl text-gradient tracking-widest"
            >
              ✨ THEN
            </motion.span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl sm:text-4xl md:text-5xl"
              style={{ filter: "drop-shadow(0 0 14px rgba(244,114,182,0.7))" }}
            >
              ❤️
            </motion.span>
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: 1.2 }}
              className="font-display text-lg sm:text-xl md:text-2xl text-gradient tracking-widest"
            >
              NOW ✨
            </motion.span>
          </div>

          {/* RIGHT — Present (faces left toward center, natural orientation) */}
          <div className="flex flex-col items-center">
            <Mosaic
              portraitSrc={PRESENT_PORTRAIT}
              tileSrcs={PRESENT_TILES}
              glowColor="rgba(217,119,255,0.55)"
            />
            <p className="mt-3 font-script text-xl sm:text-2xl text-gradient">Present-day Gayatri</p>
          </div>
        </div>

        <p className="text-center mt-12 font-script text-xl sm:text-2xl text-gradient max-w-3xl mx-auto">
          "From little dreams to the beautiful person you are today. ❤️"
        </p>
      </div>
    </section>
  );
}