import { Marginalia } from "../shared/Marginalia";
import { SectionNumber } from "../shared/SectionNumber";

const pillars = [
  {
    label: "Storage",
    body: "Encrypted memory chunks live on 0G's decentralized storage — permanent, owned by your wallet, accessible only by keys you control.",
  },
  {
    label: "Compute",
    body: "Semantic search over your memory runs on 0G Compute. The right policy surfaces when an agent asks for it, no central index required.",
  },
  {
    label: "Chain",
    body: "Your agent identity, vault manifest, and access grants are all on 0G Chain — verifiable, revocable, and yours.",
  },
  {
    label: "Privacy",
    body: "Memory is encrypted client-side using your wallet's keys before it touches the network. Mnemo can't read your memory. Neither can 0G.",
  },
];

export function WhyZeroG() {
  return (
    <section className="lg:w-[80%] md:w-[80%] w-[90%] mx-auto my-16 flex gap-20">
      <Marginalia label="Why on-chain?">
        because a database with a CEO is just another silo with extra steps.
      </Marginalia>
<div>
      <SectionNumber number="02" label="Why 0G" />

      <h2 className="font-serif text-3xl md:text-5xl leading-[1.1] text-(--color-ink) mb-16 max-w-3xl">
        Infrastructure built for AI workloads,
        <br />
        not against them.
      </h2>

      <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-3xl">
        {pillars.map((pillar) => (
          <div key={pillar.label}>
            <div className="font-serif italic text-base text-(--color-marginalia) mb-3">
              — {pillar.label}
            </div>
            <p className="text-base text-(--color-ink-soft) leading-relaxed">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
