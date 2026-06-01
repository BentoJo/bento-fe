import { ChevronDown } from "lucide-react";
import { faqs } from "@/features/landing/data/content";
import { Reveal } from "@/features/landing/components/reveal";

export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] px-5 transition-colors open:border-blue-500/30 open:bg-white/[0.05] [&_summary]:list-none"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-medium text-white [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="size-5 shrink-0 text-[#64748B] transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-5 pr-8 text-sm leading-relaxed text-[#94A3B8]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
