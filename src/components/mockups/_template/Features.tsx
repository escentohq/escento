import { Section } from "@/components/mockups/_shared/Section";

const ITEMS = [
  { title: "Feature one", body: "Describe it. Be specific." },
  { title: "Feature two", body: "Describe it. Be specific." },
  { title: "Feature three", body: "Describe it. Be specific." },
];

export function Features() {
  return (
    <Section className="bg-white">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {ITEMS.map((it) => (
          <div key={it.title}>
            <h3 className="text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-neutral-600">{it.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
