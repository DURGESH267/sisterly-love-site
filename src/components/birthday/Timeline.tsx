import { motion } from "framer-motion";

const events = [
  { year: "Childhood", title: "Where it all began", text: "Tiny hands, big laughs, endless games." },
  { year: "School Days", title: "Lunchbox swaps & secrets", text: "You always shared the best stories." },
  { year: "Family Trips", title: "Roadtrips & rooftops", text: "Backseat singing, sunset memories." },
  { year: "Special Moments", title: "Milestones together", text: "Every win felt like a shared win." },
  { year: "Today", title: "Still my favorite person", text: "And only getting more amazing." },
];

export function Timeline() {
  return (
    <section className="relative z-10 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-4xl font-bold sm:text-5xl"
        >
          Our <span className="text-gradient">Timeline</span>
        </motion.h2>

        <div className="relative mt-16">
          <div
            className="absolute left-4 top-0 h-full w-0.5 sm:left-1/2 sm:-translate-x-1/2"
            style={{ background: "var(--gradient-primary)", opacity: 0.4 }}
          />
          {events.map((e, i) => (
            <motion.div
              key={e.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className={`relative mb-10 ml-12 sm:mb-14 sm:ml-0 sm:w-1/2 ${
                i % 2 === 0 ? "sm:pr-10" : "sm:ml-auto sm:pl-10"
              }`}
            >
              <div
                className="absolute -left-10 top-4 h-4 w-4 rounded-full ring-4 ring-white sm:left-auto sm:top-6"
                style={{
                  background: "var(--gradient-primary)",
                  ...(i % 2 === 0
                    ? { right: "-2.6rem" }
                    : { left: "-2.6rem" }),
                }}
              />
              <div className="glass rounded-2xl p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">{e.year}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}