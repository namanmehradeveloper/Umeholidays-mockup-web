import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import { Button } from "../../components/common/Button";

export default function About() {
  const tourCategories = [
    {
      title: "Historical & Heritage Tours",
      count: "12+ Packages",
      icon: "🏰",
      desc: "Palaces, forts, and royal architecture across Rajasthan.",
    },
    {
      title: "Wildlife Safari Tours",
      count: "5+ Packages",
      icon: "🐅",
      desc: "Ranthambore & Sariska tiger safaris and desert reserves.",
    },
    {
      title: "Religious & Spiritual Tours",
      count: "8+ Packages",
      icon: "🛕",
      desc: "Pushkar, Ajmer Sharif, and sacred temple circuits.",
    },
    {
      title: "Honeymoon & Romantic Escapes",
      count: "10+ Packages",
      icon: "👑",
      desc: "Luxury lake palace stays and romantic desert camps.",
    },
    {
      title: "Short & Express City Tours",
      count: "6+ Packages",
      icon: "🐪",
      desc: "Weekend getaways to Jaipur, Jodhpur, and Udaipur.",
    },
    {
      title: "Culture & Festival Events",
      count: "7+ Packages",
      icon: "🎪",
      desc: "Pushkar Camel Fair, Desert Festival, and Jaipur Literature Fest.",
    },
  ];

  const rajasthanCities = [
    {
      name: "Jaipur",
      highlight: "Pink City • Amer Fort • City Palace",
    },
    {
      name: "Udaipur",
      highlight: "City of Lakes • Lake Pichola • Jagmandir",
    },
    {
      name: "Jodhpur",
      highlight: "Sun City • Mehrangarh Fort • Umaid Bhawan",
    },
    {
      name: "Jaisalmer",
      highlight: "Golden City • Thar Desert Safaris • Haveli Tour",
    },
    {
      name: "Pushkar & Ajmer",
      highlight: "Brahma Temple • Holy Lake • Ajmer Dargah",
    },
    {
      name: "Sawai Madhopur",
      highlight: "Ranthambore National Park • Royal Safaris",
    },
  ];

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
            AMAZING RAJASTHAN TOURS
        ====================================================== */}
        <section className="mb-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-[#a35b36]
              "
            >
              Curated Experiences
            </span>

            <h2
              className="
                mt-2
                font-serif
                text-3xl
                font-medium
                text-[#1b1917]
                sm:text-4xl
              "
            >
              Amazing Rajasthan Tours
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#746c64]">
              Explore specialized Rajasthan holiday categories modeled for all
              traveler types.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tourCategories.map((cat, idx) => (
              <div
                key={idx}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-[#e8e1d8]
                  bg-white
                  p-6
                  shadow-[0_8px_30px_rgba(35,29,24,0.045)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#b76b43]/50
                  hover:shadow-[0_18px_45px_rgba(35,29,24,0.09)]
                "
              >
                {/* Hover accent */}
                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-1
                    w-0
                    bg-[#b76b43]
                    transition-all
                    duration-300
                    group-hover:w-full
                  "
                />

                <div className="mb-5 flex items-center justify-between gap-4">
                  <span
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-[#ebe4da]
                      bg-[#faf8f4]
                      text-2xl
                      transition-transform
                      duration-300
                      group-hover:scale-105
                    "
                  >
                    {cat.icon}
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-[#b76b43]/10
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-[#a35b36]
                    "
                  >
                    {cat.count}
                  </span>
                </div>

                <h3
                  className="
                    font-serif
                    text-xl
                    font-medium
                    leading-snug
                    text-[#1b1917]
                    transition-colors
                    duration-200
                    group-hover:text-[#a35b36]
                  "
                >
                  {cat.title}
                </h3>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-6
                    text-[#746c64]
                    sm:text-sm
                  "
                >
                  {cat.desc}
                </p>

                <div
                  className="
                    mt-5
                    inline-flex
                    items-center
                    text-xs
                    font-bold
                    text-[#a35b36]
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                >
                  Explore Packages
                  <span className="ml-2">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            DESTINATION COVERAGE
        ====================================================== */}
        <section
          className="
            relative
            mb-20
            overflow-hidden
            rounded-[28px]
            border
            border-[#e5ddd3]
            bg-[#faf8f4]
            p-7
            sm:rounded-[34px]
            sm:p-10
            lg:p-12
          "
        >
          {/* Background decoration */}
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              bg-[#b76b43]/[0.05]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              -left-20
              h-72
              w-72
              rounded-full
              border
              border-[#b76b43]/10
            "
          />

          <div className="relative z-10">
            <div className="mb-10 max-w-3xl">
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#a35b36]
                "
              >
                Destination Coverage
              </span>

              <h2
                className="
                  mt-2
                  font-serif
                  text-3xl
                  font-medium
                  leading-tight
                  text-[#1b1917]
                  sm:text-4xl
                "
              >
                Rajasthan Major Cities & Cultural Events
              </h2>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-[#746c64]
                "
              >
                We focus exclusively on Rajasthan destinations (No
                International Tours) to guarantee unmatched local expertise.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rajasthanCities.map((city, idx) => (
                <div
                  key={idx}
                  className="
                    group
                    rounded-2xl
                    border
                    border-[#e5ddd3]
                    bg-white
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-[#b76b43]/50
                    hover:shadow-[0_12px_30px_rgba(35,29,24,0.07)]
                  "
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="
                        mt-1
                        flex
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        bg-[#b76b43]
                      "
                    />

                    <div>
                      <h4
                        className="
                          font-serif
                          text-lg
                          font-medium
                          text-[#1b1917]
                          transition-colors
                          group-hover:text-[#a35b36]
                        "
                      >
                        {city.name}
                      </h4>

                      <p
                        className="
                          mt-1.5
                          text-xs
                          leading-5
                          text-[#777068]
                        "
                      >
                        {city.highlight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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