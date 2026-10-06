'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import RichTextEditor from '../../../components/common/RichTextEditor';

const empty = {
  title: '',
  location: '',
  category: '',
  date: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: '',
};

export default function OrganizerEventsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const result = await apiFetch<any[]>(
        '/events?mine=true&limit=100'
      );

      setItems(result.data || []);
    } catch (e: any) {
      setError(e.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(item: any) {
    setEditing(item);

    setForm({
      title: item.title || '',
      location: item.location || '',
      category: item.category || '',
      date: item.date || '',
      startDate: item.startDate
        ? new Date(item.startDate).toISOString().slice(0, 16)
        : '',
      endDate: item.endDate
        ? new Date(item.endDate).toISOString().slice(0, 16)
        : '',
      description: item.description || '',
      highlights: (item.highlights || []).join('\n'),
    });
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      highlights: form.highlights
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    try {
      await apiFetch(
        editing
          ? `/events/${encodeURIComponent(editing._id)}`
          : '/events',
        {
          method: editing ? 'PATCH' : 'POST',
          data: payload,
        }
      );

      setEditing(null);
      setForm(empty);

      await load();
    } catch (e: any) {
      setError(e.message || 'Unable to save event');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-5 pb-20 pt-36">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[.25em] text-[#a35b36]">
              Organizer
            </p>

            <h1 className="mt-2 font-serif text-5xl">
              My events
            </h1>

            <p className="mt-2 text-sm text-black/50">
              Create events for admin review. Organizers cannot
              publish directly.
            </p>
          </div>

          <Link
            href="/account"
            className="text-sm underline"
          >
            Back to account
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Event Form */}
        <form
          onSubmit={submit}
          className="mt-8 grid gap-3 rounded-2xl border bg-white p-6 md:grid-cols-2"
        >
          {/* Title */}
          <input
            required
            placeholder="Event title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="rounded-xl border p-3"
          />

          {/* Location */}
          <input
            required
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
              })
            }
            className="rounded-xl border p-3"
          />

          {/* Category */}
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="rounded-xl border p-3"
          />

          {/* Public Date */}
          <input
            placeholder="Public date label"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            className="rounded-xl border p-3"
          />

          {/* Start Date */}
          <label className="text-xs font-semibold">
            Start date

            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  startDate: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl border p-3 text-sm font-normal"
            />
          </label>

          {/* End Date */}
          <label className="text-xs font-semibold">
            End date

            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  endDate: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl border p-3 text-sm font-normal"
            />
          </label>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold text-[#4f4944]">Description</label>
            <RichTextEditor
              value={form.description}
              onChange={(description) =>
                setForm((current) => ({
                  ...current,
                  description,
                }))
              }
              placeholder="Describe the event…"
              minHeight={150}
            />
          </div>

          {/* Highlights */}
          <textarea
            placeholder="Highlights — one per line"
            value={form.highlights}
            onChange={(e) =>
              setForm({
                ...form,
                highlights: e.target.value,
              })
            }
            className="min-h-28 rounded-xl border p-3 md:col-span-2"
          />

          {/* Buttons */}
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#b76b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#934f30] disabled:opacity-50"
            >
              {saving
                ? 'Saving…'
                : editing
                  ? 'Update event'
                  : 'Submit event for review'}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-5 py-3 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Events List */}
        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-sm text-black/50">
              Loading…
            </p>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-sm text-black/50">
                        {item.location} ·{' '}
                        {item.date || 'Dates to be announced'}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#faf8f4] px-3 py-1 text-xs">
                      {item.isPublished
                        ? 'Published'
                        : 'Pending admin approval'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => edit(item)}
                    className="mt-4 rounded-lg border px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                </div>
              ))}

              {!items.length && (
                <div className="rounded-2xl border bg-[#faf8f4] p-8 text-sm text-black/50">
                  No events found.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}