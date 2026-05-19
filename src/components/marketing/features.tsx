const features = [
  {
    icon: "📅",
    title: "Lägg till en gång",
    body:
      "Registrera dina anställda och deras födelsedagar. Vi tar hand om resten, år efter år.",
  },
  {
    icon: "🥐",
    title: "Lokala bagerier",
    body:
      "Vi samarbetar med utvalda bagerier i din stad. Färska tårtor, riktig kvalitet, ingen mellanlandning.",
  },
  {
    icon: "📬",
    title: "Smarta påminnelser",
    body:
      "Du får mail 14 dagar, 7 dagar och 1 dag innan, så du alltid är förberedd.",
  },
  {
    icon: "🇸🇪",
    title: "Svenska helgdagar",
    body:
      "Faller födelsedagen på en röd dag flyttar vi automatiskt leveransen till närmaste vardag.",
  },
  {
    icon: "💳",
    title: "En faktura i månaden",
    body:
      "Ingen administration, ingen utläggshantering. En samlad månadsfaktura, klart.",
  },
  {
    icon: "🎈",
    title: "Pausa fritt",
    body:
      "Semestertider eller hybridkontor? Pausa eller justera när det passar er.",
  },
];

export function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-slate-900">
            Allt du behöver,{" "}
            <span className="text-candy-500">inget du inte behöver.</span>
          </h2>
          <p className="mt-4 text-lg font-script font-normal text-slate-600">
            Happysent, byggt för företag som bryr sig om sina människor.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-candy-100 bg-cream-50 p-6 transition-shadow hover:shadow-soft"
            >
              <div className="text-3xl" aria-hidden>
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
