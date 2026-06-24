import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import gayatriMosaic from "@/assets/gayatri-mosaic.png.asset.json";

// ============================================================
// PHOTO MOSAIC — true canvas-based mosaic
// ------------------------------------------------------------
// Replace PORTRAIT_SRC with Gayatri's real portrait photo.
// Replace TILE_SRCS with real family photos (more = better mosaic).
// Tip: 30–80 tile photos give a great result. Each is rendered
//      hundreds of times across the portrait.
// ============================================================

const PORTRAIT_SRC = gayatriMosaic.url; // <-- replace with Gayatri's portrait

// Placeholder animal photos (replace with family photos later)
const TILE_SRCS = [
  "1425082661705-1834bfd09dca", "1444212477490-ca407925329e",
  "1517849845537-4d257902454a", "1543466835-00a7907e9de1",
  "1574158622682-e40e69881006", "1592194996308-7b43878e84a6",
  "1546182990-dffeafbe841d", "1583337130417-3346a1be7dee",
  "1561948955-570b270e7c36", "1535268647677-300dbf3d78d1",
  "1444212477490-ca407925329e", "1530092285049-1c42085fd395",
  "1450778869180-41d0601e046e", "1543852786-1cf6624b9987",
  "1518791841217-8f162f1e1131", "1573865526739-10659fec78a5",
  "1437622368342-7a3d40b3d6d4", "1551717743-49959800b1f6",
  "1552053831-71594a27632d", "1583511655826-05700d52f4d9",
  "1425082661705-1834bfd09dca", "1592194996308-7b43878e84a6",
  "1438761681033-6461ffad8d80", "1488161628813-04466f872be2",
  "1507003211169-0a1dd7228f2d", "1502685104226-ee32379fefbe",
  "1531123897727-8f129e1688ce", "1500917293891-ef795e70e1f6",
  "1463453091185-61582044d556", "1524504388940-b1c1722653e1",
].map((id) => `https://images.unsplash.com/photo-${id}?w=180&h=180&fit=crop&q=70`);

// Mosaic resolution — number of cells across/down. Higher = finer detail.
const COLS = 60;
const ROWS = 75;
const TILE_PX = 24; // px per tile in the rendered mosaic (final image: COLS*TILE_PX × ROWS*TILE_PX)

type Tile = { img: HTMLImageElement; avg: [number, number, number]; src: string };

function loadImage(src: string, crossOrigin = "anonymous"): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function avgColor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): [number, number, number] {
  const { data } = ctx.getImageData(x, y, w, h);
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  return [r / n, g / n, b / n];
}

export default function MemoriesGallery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const tileMapRef = useRef<{ srcIdx: number; cx: number; cy: number }[]>([]);
  const tilesRef = useRef<Tile[]>([]);

  // Pan/zoom state
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // Hover
  const [hover, setHover] = useState<{ col: number; row: number; src: string; px: number; py: number } | null>(null);

  const MOSAIC_W = COLS * TILE_PX;
  const MOSAIC_H = ROWS * TILE_PX;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Load portrait
      const portrait = await loadImage(PORTRAIT_SRC);

      // Sample portrait colors per cell
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = COLS;
      sampleCanvas.height = ROWS;
      const sctx = sampleCanvas.getContext("2d")!;
      sctx.drawImage(portrait, 0, 0, COLS, ROWS);
      const targetData = sctx.getImageData(0, 0, COLS, ROWS).data;

      // 2. Load tiles and compute their average colors
      const tileImgs = await Promise.all(
        TILE_SRCS.map((src) =>
          loadImage(src).catch(() => null)
        ),
      );
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = 32;
      tileCanvas.height = 32;
      const tctx = tileCanvas.getContext("2d", { willReadFrequently: true })!;
      const tiles: Tile[] = [];
      tileImgs.forEach((img, i) => {
        if (!img) return;
        tctx.clearRect(0, 0, 32, 32);
        tctx.drawImage(img, 0, 0, 32, 32);
        tiles.push({ img, avg: avgColor(tctx, 0, 0, 32, 32), src: TILE_SRCS[i] });
      });
      if (cancelled) return;
      tilesRef.current = tiles;

      // 3. Match each cell to closest tile by avg color
      const map: { srcIdx: number; cx: number; cy: number }[] = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = (row * COLS + col) * 4;
          const tr = targetData[i], tg = targetData[i + 1], tb = targetData[i + 2];
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

      // 4. Render mosaic to canvas progressively (assembly animation)
      const canvas = canvasRef.current!;
      canvas.width = MOSAIC_W;
      canvas.height = MOSAIC_H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1a0a1f";
      ctx.fillRect(0, 0, MOSAIC_W, MOSAIC_H);

      // Shuffle render order for nice assembly
      const order = map.map((_, i) => i).sort(() => Math.random() - 0.5);
      const CHUNK = Math.ceil(order.length / 40);
      let i = 0;

      const tick = () => {
        if (cancelled) return;
        const end = Math.min(order.length, i + CHUNK);
        for (; i < end; i++) {
          const cell = map[order[i]];
          const tile = tiles[cell.srcIdx];
          const x = cell.cx * TILE_PX;
          const y = cell.cy * TILE_PX;
          ctx.drawImage(tile.img, x, y, TILE_PX, TILE_PX);
          // Color-tint overlay to bias tile toward the target portrait color (boosts likeness)
          const idx = (cell.cy * COLS + cell.cx) * 4;
          const tr = targetData[idx], tg = targetData[idx + 1], tb = targetData[idx + 2];
          ctx.fillStyle = `rgba(${tr|0},${tg|0},${tb|0},0.45)`;
          ctx.fillRect(x, y, TILE_PX, TILE_PX);
        }
        setProgress(i / order.length);
        if (i < order.length) requestAnimationFrame(tick);
        else setReady(true);
      };
      requestAnimationFrame(tick);
    })().catch((e) => console.error("Mosaic build failed", e));

    return () => { cancelled = true; };
  }, [MOSAIC_W, MOSAIC_H]);

  // Wheel zoom
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setTransform((t) => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const newScale = Math.min(8, Math.max(1, t.scale * factor));
        const ratio = newScale / t.scale;
        return {
          scale: newScale,
          x: mx - (mx - t.x) * ratio,
          y: my - (my - t.y) * ratio,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Pinch + drag
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
    // hover detection
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !ready) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { setHover(null); return; }
    const col = Math.floor((x / rect.width) * COLS);
    const row = Math.floor((y / rect.height) * ROWS);
    const cell = tileMapRef.current[row * COLS + col];
    if (!cell) return;
    const tile = tilesRef.current[cell.srcIdx];
    const wrect = wrap.getBoundingClientRect();
    setHover({ col, row, src: tile.src, px: e.clientX - wrect.left, py: e.clientY - wrect.top });
  };
  const onMouseUp = () => { dragRef.current = null; };
  const onMouseLeave = () => { dragRef.current = null; setHover(null); };

  const resetView = () => setTransform({ scale: 1, x: 0, y: 0 });

  const sparkles = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({
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
          Hundreds of little moments come together to form the person we love. Scroll
          or pinch to zoom in — every tile is a memory.
        </p>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Floating sparkles */}
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="pointer-events-none absolute text-yellow-300/70"
            style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6], rotate: [0, 180] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.div>
        ))}

        <div
          ref={wrapRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative mx-auto rounded-3xl p-3 sm:p-5 glass-strong shadow-[0_0_80px_-10px_rgba(236,72,153,0.5)] border border-white/20"
          style={{ touchAction: "none", cursor: transform.scale > 1 ? "grab" : "zoom-in" }}
        >
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-black/40"
            style={{ aspectRatio: `${COLS} / ${ROWS}` }}
          >
            <div
              className="absolute inset-0 origin-top-left will-change-transform"
              style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
            >
              <canvas
                ref={canvasRef}
                className="block w-full h-full select-none"
                style={{ imageRendering: transform.scale > 2 ? "pixelated" : "auto" }}
              />
              {/* Hover highlight box */}
              {hover && ready && (
                <div
                  className="pointer-events-none absolute border-2 border-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]"
                  style={{
                    left: `${(hover.col / COLS) * 100}%`,
                    top: `${(hover.row / ROWS) * 100}%`,
                    width: `${100 / COLS}%`,
                    height: `${100 / ROWS}%`,
                  }}
                />
              )}
            </div>

            {/* Hover tooltip showing the ORIGINAL tile photo */}
            {hover && ready && (
              <div
                className="pointer-events-none absolute z-20 rounded-xl overflow-hidden border border-white/40 shadow-2xl bg-black/60 backdrop-blur"
                style={{
                  left: Math.min(hover.px + 16, (wrapRef.current?.clientWidth ?? 0) - 140),
                  top: Math.min(hover.py + 16, (wrapRef.current?.clientHeight ?? 0) - 140),
                  width: 120,
                  height: 120,
                }}
              >
                <img src={hover.src} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Loading overlay */}
            {!ready && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-white/90 font-display text-lg mb-3">
                  Assembling memories… {Math.round(progress * 100)}%
                </div>
                <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-amber-300 transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs sm:text-sm text-foreground/70">
            <button
              onClick={() => setTransform((t) => ({ ...t, scale: Math.max(1, t.scale / 1.4) }))}
              className="px-3 py-1 rounded-full glass hover:bg-white/20 transition"
            >−</button>
            <span className="tabular-nums w-16 text-center">{transform.scale.toFixed(2)}×</span>
            <button
              onClick={() => setTransform((t) => ({ ...t, scale: Math.min(8, t.scale * 1.4) }))}
              className="px-3 py-1 rounded-full glass hover:bg-white/20 transition"
            >+</button>
            <button onClick={resetView} className="px-3 py-1 rounded-full glass hover:bg-white/20 transition">
              Reset
            </button>
            <span className="hidden sm:inline opacity-60">· scroll / pinch to zoom · drag to pan</span>
          </div>
        </div>

        <p className="text-center mt-8 font-script text-xl sm:text-2xl text-gradient">
          "Every memory is a small piece of the beautiful person you are today. ❤️"
        </p>
      </div>
    </section>
  );
}