import { SectionNumber } from "../shared/SectionNumber";

const steps = [
  {
    num: "i.",
    title: "Register your agent identity",
    body: "Connect your wallet and register on 0G Chain. This becomes the cryptographic anchor for your memory — the address that owns the vault.",
  },
  {
    num: "ii.",
    title: "Save your policies and preferences",
    body: "Tell your agent what matters. Saved recipients, payment routing, communication preferences. Each policy is encrypted and stored on 0G Storage. Only your wallet can decrypt them.",
  },
  {
    num: "iii.",
    title: "Grant access to apps you trust",
    body: "When a new agent app wants to read your memory, it asks. You decide what it can see — by policy type, with optional expiry. Revoke any time.",
  },
  {
    num: "iv.",
    title: "Agents act on your behalf",
    body: "When an agent needs to send a payment, it reads your policy, constructs the transaction, and executes through KeeperHub for guaranteed delivery. The action gets logged back to your vault.",
  },
];



const HIW = () => {
  return (
    <section
      id="how-it-works"
      className="bg-(--color-paper-shade) py-24 border-t border-b border-(--color-rule)"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <SectionNumber number="01" label="How it works" />

        <h2 className="font-serif text-3xl md:text-5xl leading-[1.1] text-(--color-ink) mb-16 max-w-3xl">
          Four steps. One vault.
          <br />
          Every agent you authorize.
        </h2>

        <div>
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`grid grid-cols-[auto_1fr] gap-x-6 md:gap-x-12 items-start py-10 ${
                i !== steps.length - 1
                  ? "border-b border-(--color-rule)"
                  : ""
              }`}
            >
              <div className="font-serif italic text-2xl md:text-4xl text-(--color-marginalia) pt-1 min-w-8">
                {step.num}
              </div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl text-(--color-ink) mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-base text-(--color-ink-soft) leading-relaxed max-w-xl">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HIW