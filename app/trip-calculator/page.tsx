import Link from "next/link";
import { ArrowUpRight, Calculator as CalculatorIcon, Sparkles } from "lucide-react";

import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import Calculator from "../../components/common/Calculator";

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          HERO / INTRO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Trip calculator"
              title="A useful number to start with."
              text="Adjust the basics to get an indicative Rajasthan travel budget."
            />

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1b1917]/35">
              <span className="flex items-center gap-2">
                <CalculatorIcon
                  size={13}
                  className="text-[#b76b43]"
                />
                Indicative estimate
              </span>

              <span className="h-1 w-1 rounded-full bg-[#b76b43]/50" />

              <span className="flex items-center gap-2">
                <Sparkles
                  size={13}
                  className="text-[#b76b43]"
                />
                Plan with confidence
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          CALCULATOR
      ========================================================= */}
      <section className="relative z-10 -mt-8 pb-20 sm:-mt-12 sm:pb-24 lg:-mt-16 lg:pb-32">
        <Container>
          <div
            className="
              rounded-[28px]
              border
              border-[#e7dfd6]
              bg-white
              p-3
              shadow-[0_25px_80px_rgba(27,25,23,0.10)]
              sm:rounded-[34px]
              sm:p-5
              lg:rounded-[40px]
              lg:p-7
            "
          >
            <Calculator />
          </div>
        </Container>
      </section>

      {/* =========================================================
          INFORMATION
      ========================================================= */}
      <section className="border-t border-[#e7dfd6] bg-[#faf8f4] py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.5fr] lg:gap-20">
            {/* Intro */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a35b36]">
                Before you book
              </p>

              <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight tracking-[-0.02em] text-[#1b1917] sm:text-5xl">
                Start with an estimate.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-[#1b1917]/50">
                Your final travel cost depends on dates, accommodation,
                transport, experiences and the way you choose to travel.
              </p>
            </div>

            {/* Points */}
            <div className="divide-y divide-[#1b1917]/10 border-y border-[#1b1917]/10">
              {[
                {
                  number: "01",
                  title: "Choose your travel basics",
                  text: "Adjust the key details of your Rajasthan trip to create a starting budget.",
                },
                {
                  number: "02",
                  title: "Use the number as a guide",
                  text: "The result is indicative and can change depending on dates, stays and inclusions.",
                },
                {
                  number: "03",
                  title: "Build the actual journey",
                  text: "Once you know what you want, our team can shape a more precise itinerary around you.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="
                    grid
                    gap-4
                    py-7
                    sm:grid-cols-[60px_1fr]
                    sm:gap-7
                    sm:py-8
                  "
                >
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-[#b76b43]">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="font-serif text-2xl text-[#1b1917] sm:text-3xl">
                      {item.title}
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#1b1917]/45">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="rounded-[30px] border border-[#e7dfd6] bg-[#faf8f4] px-6 py-14 text-center shadow-[0_15px_45px_rgba(27,25,23,0.05)] sm:rounded-[36px] sm:px-10 sm:py-16 lg:px-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">
              Ready to go further?
            </p>

            <h2
              className="
                mx-auto
                mt-4
                max-w-3xl
                font-serif
                text-4xl
                leading-tight
                tracking-[-0.03em]
                text-[#1b1917]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Turn your estimate into
              <br />
              a real Rajasthan journey.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/50 sm:text-base">
              Share your dates, interests and preferred pace with us. We'll
              help turn the numbers into an itinerary that fits you.
            </p>

            <Link
              href="/plan-your-trip"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#b76b43]
                px-6
                py-3.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#934f30]
                hover:shadow-[0_18px_40px_rgba(183,107,67,0.22)]
              "
            >
              Plan my journey
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}