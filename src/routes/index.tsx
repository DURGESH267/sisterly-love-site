import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FloatingBackground } from "@/components/birthday/FloatingBackground";
import { OpeningScreen } from "@/components/birthday/OpeningScreen";
import { EnvelopeOpen } from "@/components/birthday/EnvelopeOpen";
import { LetterSection } from "@/components/birthday/LetterSection";
import { MemoriesGallery } from "@/components/birthday/MemoriesGallery";
import { WhyAmazing } from "@/components/birthday/WhyAmazing";
import { Timeline } from "@/components/birthday/Timeline";
import { Wishes } from "@/components/birthday/Wishes";
import { FinalSurprise } from "@/components/birthday/FinalSurprise";
import { Footer } from "@/components/birthday/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday Gayatri ❤️ — from Teja" },
      { name: "description", content: "A heartfelt birthday gift website made with love for Gayatri." },
      { property: "og:title", content: "Happy Birthday Gayatri ❤️" },
      { property: "og:description", content: "A heartfelt birthday gift website made with love by Teja." },
    ],
  }),
  component: Index,
});

function Index() {
  // 'opening' → 'envelope' → 'card' (full site)
  const [stage, setStage] = useState<"opening" | "envelope" | "card">("opening");

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <FloatingBackground />

      <AnimatePresence mode="wait">
        {stage === "opening" && (
          <OpeningScreen key="open" onOpen={() => setStage("envelope")} />
        )}
        {stage === "envelope" && (
          <EnvelopeOpen key="env" onDone={() => setStage("card")} />
        )}
        {stage === "card" && (
          <motion.main
            key="card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <LetterSection />
            <MemoriesGallery />
            <WhyAmazing />
            <Timeline />
            <Wishes />
            <FinalSurprise />
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
