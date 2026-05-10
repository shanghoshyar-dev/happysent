const steps = [
  {
    n: "01",
    title: "Registrera ditt team",
    body:
      "Lägg till anställdas namn, mail och födelsedag. Det tar några minuter.",
  },
  {
    n: "02",
    title: "Vi bokar tårtan",
    body:
      "Två veckor innan får du en bekräftelse. En vecka innan skickas beställningen till bageriet.",
  },
  {
    n: "03",
    title: "Tårtan levereras",
    body:
      "På födelsedagen står den färska tårtan på kontoret mellan 08:00 och 11:00.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-cream-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-slate-900">Så funkar det</h2>
          <p className="mt-4 text-lg text-slate-600">
            Tre steg från första registrering till första tårtan på bordet.
          </p>
        </div>
        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-candy-100"
            >
              <span className="font-display text-5xl text-candy-300">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
