import Image from 'next/image';
import Link from 'next/link';
import Container from '../../components/common/Container';
import SectionHeading from '../../components/common/SectionHeading';
import RichText from '../../components/common/RichText';
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
} from 'lucide-react';
import { apiList } from '../../lib/api';

export const dynamic = 'force-dynamic';

type Event = {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  location?: string;
  category?: string;
  date?: string;
  image?: string;
  description?: string;
};

export default async function Events() {
  const events = await apiList<Event>('/events?limit=100');

  return (
    <main className="min-h-screen bg-white pt-24 pb-24 text-[#1b1917] sm:pt-28 lg:pt-36">
      <Container>

        {/* Header */}
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Events"
            title="Travel with Rajasthan's calendar."
            text="Discover cultural moments, festivals and seasonal events across Rajasthan."
          />
        </div>

        {/* Events Grid */}
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event._id || event.id || event.slug}
              href={`/events/${event.slug}`}
              className="group overflow-hidden rounded-3xl border border-black/[0.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#b76b43]/40 hover:shadow-[0_18px_45px_rgba(27,25,23,0.08)]"
            >

              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f5f3ef]">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#f5f3ef]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                      Rajasthan Event
                    </span>
                  </div>
                )}

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70" />

                {/* Category */}
                <div className="absolute left-4 top-4">
                  <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a35b36] shadow-sm backdrop-blur-sm">
                    {event.category || 'Rajasthan'}
                  </span>
                </div>

                {/* Arrow */}
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1b1917] shadow-sm transition-all duration-300 group-hover:bg-[#b76b43] group-hover:text-white">
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-7">

                <h2 className="font-serif text-2xl leading-tight text-[#1b1917] transition-colors duration-300 group-hover:text-[#a35b36] sm:text-3xl">
                  {event.title}
                </h2>

                {/* Event Info */}
                <div className="mt-5 space-y-3 border-t border-black/[0.07] pt-5 text-sm text-black/55">

                  {event.location && (
                    <p className="flex items-start gap-2.5">
                      <MapPin
                        size={16}
                        strokeWidth={1.7}
                        className="mt-0.5 shrink-0 text-[#a35b36]"
                      />
                      <span>{event.location}</span>
                    </p>
                  )}

                  <p className="flex items-start gap-2.5">
                    <CalendarDays
                      size={16}
                      strokeWidth={1.7}
                      className="mt-0.5 shrink-0 text-[#a35b36]"
                    />
                    <span>
                      {event.date || 'Dates to be announced'}
                    </span>
                  </p>

                </div>

                {/* Description */}
                {event.description && (
                  <RichText
                    value={event.description}
                    className="mt-5 line-clamp-3 text-sm leading-6 text-black/55"
                  />
                )}

                {/* View Event */}
                <div className="mt-6 flex items-center justify-between border-t border-black/[0.07] pt-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1b1917]">
                    View Event
                  </span>

                  <span className="text-[#a35b36] transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.8}
                    />
                  </span>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!events.length && (
          <div className="mt-12 rounded-3xl border border-dashed border-black/10 bg-[#faf9f7] px-6 py-16 text-center">
            <CalendarDays
              size={30}
              strokeWidth={1.5}
              className="mx-auto text-black/30"
            />

            <h2 className="mt-5 font-serif text-2xl text-[#1b1917]">
              No events available
            </h2>

            <p className="mt-2 text-sm text-black/50">
              No published events yet. Please check back soon.
            </p>
          </div>
        )}

      </Container>
    </main>
  );
}