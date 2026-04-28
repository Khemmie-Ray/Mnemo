import Link from "next/link";
import { Marginalia } from "../shared/Marginalia";

const Hero = () => {
  return (
    <section className="lg:w-[80%] md:w-[80%] w-[90%] mx-auto my-16 flex gap-20">
      <Marginalia label="Note —">
        Mnemo, n. — from Greek mnēmē, memory. The faculty by which things are recalled
      </Marginalia>
      <div>
        <div className="font-serif italic text-sm text-(--color-marginalia) mb-6 flex items-center gap-3">
          <span className="block w-8 h-px bg-(--color-marginalia) opacity-40" />
          a memory layer for AI agents
        </div>

        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-(--color-ink) mb-8">
          Memory that{" "}
          <em className="text-(--color-marginalia) font-serif italic">
            belongs
          </em>
          <br />
          to you,
          <br />
          not the app.
        </h1>

        <p className="text-lg md:text-xl text-(--color-ink-soft) leading-relaxed max-w-2xl mb-10">
          Every AI agent forgets you between sessions. The memory that does
          exist is locked inside whoever built the agent. Mnemo is user-owned
          memory and policy storage on 0G — portable across every agent you use.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <Link href="/onboarding"    className="text-[14px] font-medium bg-(--color-ink) text-(--color-paper) px-5 py-2.5 border border-(--color-ink)/10 hover:bg-(--color-paper) hover:text-(--color-ink) transition-colors">
            Connect wallet to begin
          </Link>
          <Link
            href="#how-it-works"
            className="font-serif italic text-base text-(--color-ink-soft) border-b border-(--color-ink-soft)/40 hover:border-(--color-ink) hover:text-(--color-ink) transition-colors pb-0.5"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;