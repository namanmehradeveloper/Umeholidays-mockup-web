"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  FileText,
  Handshake,
  HeartHandshake,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Container from "../../components/common/Container";
import { useSiteSettings } from "../../components/common/useSiteSettings";
import { apiFetch, apiList } from "../../lib/api";
import { isValidPhone, PHONE_ERROR, phoneDigits } from "../../lib/phone";

/* =========================================================
   CONSTANTS
========================================================= */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80";

const EXPERT_IMAGE =
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80";

const LOCATION_IMAGE =
  "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=500&q=80";

const MESSAGE_LIMIT = 500;

const FALLBACK_DESTINATIONS = ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Bikaner", "Mount Abu"];

const TRAVELLER_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const heroFeatures = [
  { label: "Personalised Support", icon: HeartHandshake },
  { label: "Quick Response", icon: Sparkles },
  { label: "Expert Travel Guidance", icon: Compass },
];

const quickHelp = [
  {
    title: "Plan a Trip",
    description: "Get a custom itinerary based on your interests.",
    href: "/plan-your-trip",
    icon: MapIcon,
  },
  {
    title: "Modify Booking",
    description: "Need to change your travel dates or details?",
    href: "/account/bookings",
    icon: CalendarCheck,
  },
  {
    title: "Travel Support",
    description: "Assistance before, during and after your trip.",
    href: "#enquiry",
    icon: ShieldCheck,
  },
  {
    title: "General Queries",
    description: "Have a question? We're here to help.",
    href: "#enquiry",
    icon: FileText,
  },
];

type Destination = {
  name?: string;
  title?: string;
  isPublished?: boolean;
};

/* =========================================================
   PAGE
========================================================= */

export default function Contact() {
  const site = useSiteSettings();
  const phoneHref = `tel:${site.phone.replace(/[^\d+]/g, "")}`;
  const mapQuery = encodeURIComponent(site.address || "Jaipur, Rajasthan, India");

  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      <Hero />

      <section className="relative bg-white pb-16 pt-4 sm:pb-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <EnquiryForm />

            <div className="flex flex-col gap-6">
              <DirectContactCard email={site.email} phone={site.phone} phoneHref={phoneHref} address={site.address} />
              <ExpertCard phoneHref={phoneHref} />
              <PartnershipCard email={site.email} />
            </div>
          </div>

          <LocationSection mapQuery={mapQuery} />
          <QuickHelp />
        </Container>
      </section>
    </main>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf6f0] via-[#fcf9f5] to-white pb-12 pt-28 sm:pt-32 lg:pb-16 lg:pt-36">
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#f3e2d3]/50 blur-3xl" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b76b43]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a35b36]">Contact UME</p>
            </div>

            <h1 className="mt-5 font-serif text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-[#171615] sm:text-6xl lg:text-[4.25rem]">
              We&apos;re here
              <br />
              to plan your
              <br />
              <span className="text-[#b76b43]">next journey.</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#68615a] sm:text-base">
              Tell us a little about your travel plans and we&apos;ll help you create a personalised journey
              around your interests, pace and time.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              {heroFeatures.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#efe2d6] bg-white text-[#b76b43] shadow-[0_6px_18px_rgba(183,107,67,0.08)]">
                    <Icon size={17} strokeWidth={1.7} />
                  </span>
                  <span className="max-w-[90px] text-xs font-semibold leading-4 text-[#3f3a36]">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[620px]">
            <p className="absolute -top-2 left-2 z-10 -rotate-6 font-serif text-xl italic leading-6 text-[#5a3f2e] sm:left-6 sm:text-2xl sm:leading-7">
              Let&apos;s
              <br />
              Explore
              <br />
              Rajasthan
            </p>

            <Plane
              size={34}
              strokeWidth={1.4}
              aria-hidden
              className="absolute -top-1 right-4 z-10 rotate-[20deg] fill-[#b76b43] text-[#b76b43] sm:right-8"
            />

            <div className="relative ml-auto aspect-[16/11] w-[94%] overflow-hidden rounded-[46%_54%_42%_58%/58%_44%_56%_42%] shadow-[0_30px_70px_rgba(91,58,36,0.18)]">
              <img src={HERO_IMAGE} alt="City Palace on Lake Pichola, Udaipur" className="h-full w-full object-cover object-center" />
            </div>

            <div className="absolute bottom-4 right-0 flex items-center gap-3 rounded-2xl border border-[#efe5dc] bg-white/95 px-4 py-3 shadow-[0_14px_36px_rgba(27,25,23,0.1)] backdrop-blur sm:bottom-8">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43]">
                <Navigation size={15} strokeWidth={1.8} />
              </span>
              <span className="text-xs font-semibold leading-4 text-[#3f3a36]">
                Your Journey
                <br />
                <span className="font-normal text-[#8a837c]">Our Priority</span>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* =========================================================
   ENQUIRY FORM
========================================================= */

function EnquiryForm() {
  const [destinations, setDestinations] = useState<string[]>(FALLBACK_DESTINATIONS);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiList<Destination>("/destinations?limit=50")
      .then((records) => {
        const names = records
          .filter((record) => record.isPublished !== false)
          .map((record) => (record.name || record.title || "").trim())
          .filter(Boolean);

        if (!cancelled && names.length) setDestinations(names);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const phone = phoneDigits(String(form.get("phone") || ""));
    const travellers = Number(form.get("travellers"));

    if (phone && !isValidPhone(phone)) {
      setError(PHONE_ERROR);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch("/enquiries", {
        method: "POST",
        data: {
          name: String(form.get("name") || "").trim(),
          email: String(form.get("email") || "").trim(),
          phone: phone || undefined,
          travelDates: String(form.get("travelDates") || "").trim() || undefined,
          destination: String(form.get("destination") || "") || undefined,
          travellers: travellers > 0 ? travellers : undefined,
          message: message.trim() || undefined,
          source: "contact",
        },
      });

      formElement.reset();
      setMessage("");
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="enquiry"
      className="scroll-mt-28 rounded-[28px] border border-[#ece5dd] bg-white p-6 shadow-[0_18px_50px_rgba(35,29,24,0.06)] sm:p-9"
    >
      {sent ? (
        <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-[#b76b43]/25 bg-[#b76b43]/10 text-[#b76b43]">
            <Check size={27} strokeWidth={2.2} />
          </span>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a35b36]">Enquiry received</p>
          <h2 className="mt-3 max-w-lg font-serif text-4xl font-medium leading-tight text-[#171615]">
            Your journey starts here.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#6b645d]">
            Thank you for reaching out to UME Holidays. One of our travel experts will get back to you shortly.
          </p>
          <button type="button" onClick={() => setSent(false)} className={`${outlineButtonClass} mt-8`}>
            Send another enquiry
          </button>
        </div>
      ) : (
        <>
          <h2 className="font-serif text-3xl font-medium text-[#171615]">Send us an Enquiry</h2>
          <p className="mt-2 text-sm text-[#8a837c]">
            Share a few details and our travel experts will get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" required>
              <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name" className={inputClass} />
            </Field>

            <Field label="Email Address" required>
              <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} />
            </Field>

            <Field label="Phone Number">
              <div className="flex">
                <span className="flex h-12 items-center rounded-l-xl border border-r-0 border-[#e4ddd4] bg-[#faf8f4] px-4 text-sm text-[#6b645d]">
                  +91
                </span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  title={PHONE_ERROR}
                  onChange={(event) => {
                    event.currentTarget.value = phoneDigits(event.currentTarget.value);
                  }}
                  placeholder="10-digit mobile number"
                  className={`${inputClass} min-w-0 flex-1 rounded-l-none`}
                />
              </div>
            </Field>

            <Field label="Preferred Travel Dates">
              <div className="relative">
                <input name="travelDates" maxLength={100} placeholder="e.g. 12–18 October" className={`${inputClass} pr-11`} />
                <CalendarDays size={16} strokeWidth={1.7} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8a837c]" />
              </div>
            </Field>

            <Field label="Destination">
              <SelectWrap>
                <select name="destination" defaultValue="" className={`${inputClass} appearance-none pr-10`}>
                  <option value="">Where would you like to go?</option>
                  {destinations.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </SelectWrap>
            </Field>

            <Field label="Number of Travellers">
              <SelectWrap>
                <select name="travellers" defaultValue="" className={`${inputClass} appearance-none pr-10`}>
                  <option value="">Select travellers</option>
                  {TRAVELLER_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "traveller" : "travellers"}
                    </option>
                  ))}
                </select>
              </SelectWrap>
            </Field>

            <Field label="Tell us about your plan" className="sm:col-span-2">
              <div className="relative">
                <textarea
                  name="message"
                  rows={5}
                  maxLength={MESSAGE_LIMIT}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what kind of journey you have in mind..."
                  className={`${inputClass} h-auto resize-none py-3.5 pb-8 leading-6`}
                />
                <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-[#9b948d]">
                  {message.length}/{MESSAGE_LIMIT}
                </span>
              </div>
            </Field>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:col-span-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#b76b43] text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(183,107,67,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#9d5735] disabled:pointer-events-none disabled:opacity-60 sm:col-span-2"
            >
              {loading ? "Sending…" : "Send Enquiry"}
              <ArrowUpRight size={15} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>

            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-[#8a827a] sm:col-span-2">
              <Lock size={12} className="text-[#b76b43]" />
              Your information is safe with us. We&apos;ll use it only to respond to your enquiry.
            </p>
          </form>
        </>
      )}
    </section>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-[#3f3a36]">
        {label}
        {required && <span className="text-[#b76b43]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8a837c]" />
    </div>
  );
}

/* =========================================================
   SIDE CARDS
========================================================= */

function DirectContactCard({
  email,
  phone,
  phoneHref,
  address,
}: {
  email: string;
  phone: string;
  phoneHref: string;
  address: string;
}) {
  const rows = [
    { label: "Email", value: email, href: `mailto:${email}`, icon: Mail },
    { label: "Call Us", value: phone, href: phoneHref, icon: Phone },
    {
      label: "Location",
      value: address || "Rajasthan, India",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "Rajasthan, India")}`,
      icon: MapPin,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#ece5dd] bg-gradient-to-br from-[#fdf8f3] to-white p-6 shadow-[0_18px_50px_rgba(35,29,24,0.05)] sm:p-7">
      <PostageStamp />

      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f7e9de] text-[#b76b43]">
        <Mail size={18} strokeWidth={1.7} />
      </span>
      <h2 className="mt-4 font-serif text-2xl font-medium text-[#171615]">Get in touch directly</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-[#8a837c]">You can also reach us through the following channels.</p>

      <div className="mt-5 space-y-3">
        {rows.map(({ label, value, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="group flex items-center gap-4 rounded-2xl border border-[#efe7df] bg-white px-4 py-3 transition-all hover:border-[#b76b43]/35 hover:shadow-[0_8px_24px_rgba(27,25,23,0.05)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43] transition group-hover:bg-[#b76b43] group-hover:text-white">
              <Icon size={16} strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#1b1917]">{label}</span>
              <span className="mt-0.5 block truncate text-sm text-[#5f5953]">{value}</span>
            </span>
            <ChevronRight size={17} className="shrink-0 text-[#6f6862] transition-transform group-hover:translate-x-0.5 group-hover:text-[#b76b43]" />
          </a>
        ))}
      </div>
    </section>
  );
}

function ExpertCard({ phoneHref }: { phoneHref: string }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#ece5dd] bg-gradient-to-r from-[#fbf3ec] to-[#f6e7da] shadow-[0_18px_50px_rgba(35,29,24,0.05)]">
      <img
        src={EXPERT_IMAGE}
        alt="UME Holidays travel expert"
        className="absolute bottom-0 right-0 h-full w-[42%] object-cover object-top [mask-image:linear-gradient(90deg,transparent,black_35%)]"
      />
      <div className="relative max-w-[62%] p-6 sm:p-7">
        <h2 className="font-serif text-2xl font-medium leading-tight text-[#171615]">
          Talk to our
          <br />
          Travel Experts
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#6b645d]">
          Need help choosing the right itinerary? Our team is here to assist you with personalised suggestions.
        </p>
        <a href={phoneHref} className={`${solidButtonClass} mt-5`}>
          <PhoneCall size={14} />
          Call Now
        </a>
      </div>
    </section>
  );
}

function PartnershipCard({ email }: { email: string }) {
  const href = `mailto:${email}?subject=${encodeURIComponent("Business & Partnerships")}`;

  return (
    <section className="flex items-center gap-5 rounded-[28px] border border-[#ece5dd] bg-white p-6 shadow-[0_18px_50px_rgba(35,29,24,0.05)] sm:p-7">
      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-xl font-medium text-[#171615]">Business &amp; Partnerships</h2>
        <p className="mt-2 text-sm leading-6 text-[#8a837c]">
          For collaborations, media, or business inquiries, drop us an email.
        </p>
        <a href={href} className={`${solidButtonClass} mt-4`}>
          Write to Us
          <ArrowUpRight size={14} />
        </a>
      </div>
      <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43]">
        <Handshake size={34} strokeWidth={1.4} />
      </span>
    </section>
  );
}

function PostageStamp() {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden
      className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rotate-12 text-[#d9c2b0]"
    >
      <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="40" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 34c8-4 16 4 24 0s16-4 24 0 16 4 24 0" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 44c8-4 16 4 24 0s16-4 24 0 16 4 24 0" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* =========================================================
   LOCATION
========================================================= */

function LocationSection({ mapQuery }: { mapQuery: string }) {
  return (
    <section className="relative mt-10 overflow-hidden rounded-[28px] border border-[#ece5dd] bg-[#f6f1ea] shadow-[0_18px_50px_rgba(35,29,24,0.05)]">
      <iframe
        title="UME Holidays location"
        src={`https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[440px] w-full border-0 grayscale-[35%] sepia-[15%] sm:h-[380px]"
      />

      <div className="absolute inset-x-4 top-4 rounded-[22px] border border-[#efe5dc] bg-white/95 p-6 shadow-[0_18px_40px_rgba(27,25,23,0.12)] backdrop-blur sm:inset-x-auto sm:left-6 sm:top-6 sm:w-[340px] sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a35b36]">Our Location</p>
        <h2 className="mt-2 font-serif text-3xl font-medium text-[#171615]">Rajasthan, India</h2>
        <p className="mt-3 max-w-[220px] text-sm leading-6 text-[#6b645d]">
          Visit us or connect with our team online. We&apos;re always happy to help you plan your dream journey.
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
          target="_blank"
          rel="noreferrer"
          className={`${outlineButtonClass} mt-5`}
        >
          <MapPin size={14} />
          Get Directions
          <ArrowUpRight size={14} />
        </a>

        <img
          src={LOCATION_IMAGE}
          alt="Hawa Mahal, Jaipur"
          className="absolute -bottom-6 -right-6 hidden h-24 w-32 rotate-[-4deg] rounded-lg border-4 border-white object-cover shadow-[0_12px_30px_rgba(27,25,23,0.18)] sm:block"
        />
      </div>
    </section>
  );
}

/* =========================================================
   QUICK HELP
========================================================= */

function QuickHelp() {
  return (
    <section className="mt-16 sm:mt-20">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#dcc9b9]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a35b36]">Quick Help</p>
          <span className="h-px w-10 bg-[#dcc9b9]" />
        </div>
        <h2 className="mt-3 font-serif text-3xl font-medium text-[#171615] sm:text-4xl">Looking for something specific?</h2>
        <p className="mt-2 text-sm text-[#8a837c]">Here are a few common ways we can help.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickHelp.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={title}
            href={href}
            className="group flex flex-col rounded-[22px] border border-[#ece5dd] bg-white p-6 shadow-[0_10px_30px_rgba(35,29,24,0.04)] transition-all hover:-translate-y-1 hover:border-[#b76b43]/30 hover:shadow-[0_18px_40px_rgba(35,29,24,0.08)]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43] transition group-hover:bg-[#b76b43] group-hover:text-white">
              <Icon size={18} strokeWidth={1.7} />
            </span>
            <h3 className="mt-5 font-serif text-xl font-medium text-[#171615]">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#8a837c]">{description}</p>
            <ArrowRight size={16} className="mt-4 self-end text-[#b76b43] transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   STYLES
========================================================= */

const inputClass =
  "h-12 w-full rounded-xl border border-[#e4ddd4] bg-white px-4 text-sm text-[#171615] outline-none transition-all placeholder:text-[#9b948d] hover:border-[#cfc5ba] focus:border-[#b76b43] focus:ring-4 focus:ring-[#b76b43]/10";

const solidButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#b76b43] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_22px_rgba(183,107,67,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#9d5735]";

const outlineButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#e2d6cb] bg-white px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f3a36] transition-all hover:border-[#b76b43] hover:text-[#a35b36]";
