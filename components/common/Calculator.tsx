'use client';

import { useMemo, useState } from 'react';
import { IndianRupee, Sparkles } from 'lucide-react';

const clampInteger = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
};

export default function Calculator() {
  const [days, setDays] = useState(5);
  const [people, setPeople] = useState(2);
  const [hotel, setHotel] = useState('4 star');
  const [transport, setTransport] = useState('Private car');
  const [activities, setActivities] = useState('Mixed');

  const total = useMemo(() => {
    const hotelPerDay = hotel === '5 star' ? 9000 : hotel === '4 star' ? 5500 : 3500;
    const transportPerDay = transport === 'Private car' ? 3500 : 1800;
    const activitiesPerDay = activities === 'Premium' ? 2500 : 1200;
    return days * (hotelPerDay + transportPerDay + activitiesPerDay) * people;
  }, [activities, days, hotel, people, transport]);

  const inputClass =
    'mt-2 w-full rounded-xl border border-[#e7dfd7] bg-white p-3 font-medium text-[#2A1810] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#b76b43]/10';

  return (
    <div className="grid gap-6 font-sans lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-[24px] border border-[#ebe5df] bg-white p-6 shadow-[0_10px_34px_rgba(27,25,23,0.045)] sm:p-7">
        <div className="border-b border-[#eee8e2] pb-4 sm:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a35b36]">Custom trip estimator</span>
          <h3 className="mt-2 font-serif text-2xl font-medium tracking-[-0.02em] text-[#1b1917] sm:text-3xl">
            Calculate your Rajasthan tour
          </h3>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
            Duration (days)
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(event) => setDays(clampInteger(Number(event.target.value), 1, 30))}
              className={inputClass}
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
            Travellers
            <input
              type="number"
              min={1}
              max={12}
              value={people}
              onChange={(event) => setPeople(clampInteger(Number(event.target.value), 1, 12))}
              className={inputClass}
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
            Accommodation standard
            <select value={hotel} onChange={(event) => setHotel(event.target.value)} className={`${inputClass} cursor-pointer`}>
              <option value="Budget">Budget Heritage Stay</option>
              <option value="4 star">4 Star Deluxe Heritage</option>
              <option value="5 star">5 Star Luxury Royal Palace</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
            Transport type
            <select value={transport} onChange={(event) => setTransport(event.target.value)} className={`${inputClass} cursor-pointer`}>
              <option value="Private car">Chauffeur Driven Private Car</option>
              <option value="Train + car">Train + Local Car</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-[#4A2E1B] sm:col-span-2">
            Activities & sightseeing
            <select value={activities} onChange={(event) => setActivities(event.target.value)} className={`${inputClass} cursor-pointer`}>
              <option value="Mixed">Mixed (Standard Forts & Cultural Walks)</option>
              <option value="Premium">Premium (Desert Safari, Elephant Ride & Light Show)</option>
            </select>
          </label>
        </div>
      </section>

      <aside className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#eadfd5] bg-[#fffaf6] p-7 shadow-[0_10px_34px_rgba(27,25,23,0.045)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b76b43]/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[#a35b36]">
            <Sparkles size={15} strokeWidth={1.7} />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Estimated package</p>
          </div>
          <div className="mt-5 flex items-start gap-1 text-[#1b1917]">
            <IndianRupee size={24} strokeWidth={1.7} className="mt-2 text-[#b76b43]" />
            <p className="font-serif text-5xl font-medium tracking-[-0.04em]">{total.toLocaleString('en-IN')}</p>
          </div>
          <div className="mt-5 space-y-1 border-t border-[#eadfd5] pt-4 text-xs font-medium text-[#6d625b]">
            <p>₹{Math.round(total / people).toLocaleString('en-IN')} per person</p>
            <p>₹{Math.round(total / days).toLocaleString('en-IN')} per day</p>
          </div>
        </div>

        <div className="relative mt-8 border-t border-[#eadfd5] pt-4">
          <p className="text-xs leading-5 text-[#756d67]">
            This is a planning estimate for a customized itinerary, not a live or binding booking price.
          </p>
        </div>
      </aside>
    </div>
  );
}
