import { motion } from "framer-motion";

const cards = [
  { emoji: "❤️", title: "Kind", text: "Your kindness lights up every room you walk into." },
  { emoji: "🌟", title: "Supportive", text: "You always show up when it matters most." },
  { emoji: "😊", title: "Caring", text: "Your care for everyone around you is endless." },
  { emoji: "💪", title: "Strong", text: "Strength wrapped in the gentlest heart." },
  { emoji: "😂", title: "Funny", text: "You make even the dullest days hilarious." },
  { emoji: "✨", title: "Inspiring", text: "You inspire me to be better, every single day." },
];

export function WhyAmazing() {
  return (
    <section className="relative z-10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-4xl font-bold sm:text-5xl"
        >
          Why You Are <span className="text-gradient">Amazing</span>
        </motion.h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass rounded-2xl p-7 transition-shadow hover:shadow-[var(--shadow-glow)]"
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-[var(--shadow-gold)]"
                style={{ background: "var(--gradient-gold)" }}
              >
                {c.emoji}
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">
                {c.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}