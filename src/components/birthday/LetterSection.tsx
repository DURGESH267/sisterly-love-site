import { motion } from "framer-motion";

const lines = [
  "You are not just my sister,",
  "you are one of the most important people in my life.",
  "Thank you for all the memories,",
  "the laughter, and the happiness you bring.",
  "I wish you success, good health,",
  "joy, and all the wonderful things life can offer.",
  "",
  "Happy Birthday Gayatri ❤️",
];

export function LetterSection() {
  return (
    <section className="relative z-10 px-6 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="glass-strong mx-auto max-w-2xl rounded-3xl p-8 sm:p-14"
      >
        <h2 className="font-script text-4xl text-primary sm:text-5xl">💌 Dear Gayatri</h2>
        <div className="mt-8 space-y-3 font-script text-xl leading-relaxed text-foreground/85 sm:text-2xl">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 * i }}
            >
              {line || "\u00A0"}
            </motion.p>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="mt-10 text-right"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">With lots of love,</p>
          <p className="font-script text-3xl text-secondary">Your Brother</p>
        </motion.div>
      </motion.div>
    </section>
  );
}