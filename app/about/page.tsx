import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import { Button } from "../../components/common/Button";

export default function About() {
  return (
    <div className="relative min-h-screen bg-white pt-20 pb-16 font-sans text-[#1b1917] selection:bg-[#b76b43] selection:text-white">
      {/* =====================================================
          TOP ACCENT
      ====================================================== */}
      <div className="h-1 w-full bg-[#b76b43]" />

      <Container>
        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="mx-auto max-w-4xl py-14 text-center sm:py-20">
          <span
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-[#e5ddd3]
              bg-[#faf8f4]
              px-4
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.24em]
              text-[#a35b36]
            "
          >
            Padharo Mhare Desh • Rajasthan Inbound DMC
          </span>

          <h1
            className="
              mt-6
              font-serif
              text-4xl
              font-medium
              tracking-tight
              text-[#1b1917]
              sm:text-5xl
              lg:text-6xl
            "
          >
            Welcome to{" "}
            <span className="text-[#b76b43]">Umeholidays</span>
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-[#68615a]
              sm:text-lg
            "
          >
            Discover the magic of royal palaces, historic forts, and desert
            dunes with Rajasthan&apos;s premier local tour specialists.
          </p>

          <div className="my-7 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d8cfc5]" />
            <span className="text-sm text-[#b76b43]">✦</span>
            <span className="h-px w-12 bg-[#d8cfc5]" />
          </div>
        </section>

        {/* =====================================================
            ABOUT US
        ====================================================== */}
        <section
          className="
            relative
            mb-20
            overflow-hidden
            rounded-[28px]
            border
            border-[#e8e1d8]
            bg-[#faf8f4]
            p-6
            shadow-[0_20px_60px_rgba(35,29,24,0.06)]
            sm:rounded-[34px]
            sm:p-10
            lg:p-12
          "
        >
          {/* Decorative corner */}
          <div
            className="
              absolute
              right-0
              top-0
              h-32
              w-32
              rounded-bl-full
              bg-[#b76b43]/[0.05]
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              h-24
              w-24
              rounded-tr-full
              bg-[#b76b43]/[0.04]
            "
          />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12">
            {/* Main copy */}
            <div className="lg:col-span-8">
              <SectionHeading
                eyebrow="Incorporated Sept 2026 • Jaipur, Rajasthan"
                title="Crafting Flawless Journeys Across Rajasthan"
                text="Umeholidays is a premier Inbound Tour Operator and Destination Management Company (DMC) led by Founder & CEO Mr. Umesh Sharma. Backed by over 15 years of elite hospitality expertise, we specialize in tailor-made journeys across Rajasthan."
              />

              <p
                className="
                  mt-5
                  max-w-3xl
                  text-sm
                  leading-7
                  text-[#68615a]
                  sm:text-base
                "
              >
                From exploring majestic historic forts and royal palaces to
                relaxing on heritage desert retreats, our local specialists
                design perfectly paced experiences for every generation—
                whether you are a younger independent explorer, senior citizen,
                or premium luxury traveler.
              </p>
            </div>

            {/* Quick Fact */}
            <div className="lg:col-span-4">
              <div
                className="
                  rounded-[24px]
                  border
                  border-[#e5ddd3]
                  bg-white
                  p-7
                  text-center
                  shadow-[0_15px_45px_rgba(35,29,24,0.07)]
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[#b76b43]/10
                    text-2xl
                  "
                >
                  ⭐
                </div>

                <h4
                  className="
                    mt-4
                    font-serif
                    text-3xl
                    font-medium
                    text-[#1b1917]
                  "
                >
                  15+ Years
                </h4>

                <p
                  className="
                    mt-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#a35b36]
                  "
                >
                  Hospitality Expertise
                </p>

                <div className="my-5 h-px bg-[#ebe4da]" />

                <p className="text-xs leading-6 text-[#746c64]">
                  Exclusive focus on Rajasthan destinations • Private &
                  custom packages
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}
        <section className="mx-auto max-w-3xl py-6 text-center sm:py-10">
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-[#a35b36]
            "
          >
            Start Your Journey
          </span>

          <h3
            className="
              mt-2
              font-serif
              text-2xl
              font-medium
              text-[#1b1917]
              sm:text-3xl
            "
          >
            Ready to Plan Your Custom Rajasthan Itinerary?
          </h3>

          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-[#746c64]
            "
          >
            Let Mr. Umesh Sharma and our expert human planners craft your
            royal holiday today.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              href="/plan-your-trip"
              className="
                rounded-full
                border
                border-[#b76b43]
                bg-[#b76b43]
                px-7
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-[0_10px_30px_rgba(183,107,67,0.18)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#934f30]
                hover:shadow-[0_14px_35px_rgba(183,107,67,0.25)]
                sm:px-8
              "
            >
              Plan Your Trip Now
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
