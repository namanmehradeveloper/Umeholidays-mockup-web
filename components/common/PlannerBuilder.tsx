'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';

import { apiErrorMessage, apiFetch } from '../../lib/api';
import { PLANNER_ICONS, formatPlannerAmount } from '../../lib/planner';
import type {
  PlannerChoice,
  PlannerDestination,
  PlannerQuote,
  PlannerSelection,
  PlannerSettings,
  PlannerStep,
  PlannerStepKey,
} from '../../lib/planner';

type SourceState = { status: 'loading' | 'ready' | 'error'; data: PlannerChoice[]; error?: string };
type SingleStepKey = 'destination' | 'duration' | 'travel-style' | 'hotel' | 'transport';

const OPTION_ENDPOINTS: Record<SingleStepKey, string> = {
  destination: '/planner/destinations',
  duration: '/planner/options/durations',
  'travel-style': '/planner/options/travel-styles',
  hotel: '/planner/options/hotels',
  transport: '/planner/options/transports',
};

const SELECTION_FIELD: Record<SingleStepKey, keyof PlannerSelection> = {
  destination: 'destinationId',
  duration: 'durationId',
  'travel-style': 'travelStyleId',
  hotel: 'hotelId',
  transport: 'transportId',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isSingleStep = (key: PlannerStepKey): key is SingleStepKey => key in OPTION_ENDPOINTS;

const activitiesEndpoint = (destinationId: string) =>
  `/planner/options/activities?destinationId=${encodeURIComponent(destinationId)}`;

const toChoice = (destination: PlannerDestination): PlannerChoice => ({
  id: destination.id,
  name: destination.name,
  description: destination.shortDescription,
  image: destination.image,
});

function emptySelection(maxAdults = 2): PlannerSelection {
  return {
    destinationId: '',
    durationId: '',
    travelStyleId: '',
    hotelId: '',
    transportId: '',
    activityIds: [],
    adults: Math.min(2, maxAdults),
    children: 0,
  };
}

const INPUT =
  'w-full rounded-xl border border-[#e8e1da] bg-white p-3 text-sm text-[#1b1917] outline-none transition focus:border-[#b76b43]';

export default function PlannerBuilder({ initialSettings }: { initialSettings?: PlannerSettings | null }) {
  const [settings, setSettings] = useState<PlannerSettings | null>(initialSettings ?? null);
  const [settingsStatus, setSettingsStatus] = useState<'loading' | 'ready' | 'error'>(initialSettings ? 'ready' : 'loading');
  const [sources, setSources] = useState<Record<string, SourceState>>({});
  const [selection, setSelection] = useState<PlannerSelection>(() => emptySelection(initialSettings?.limits.maxAdults));
  const [stepIndex, setStepIndex] = useState(0);

  const [quote, setQuote] = useState<PlannerQuote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [quoteError, setQuoteError] = useState('');
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const quoteSeq = useRef(0);

  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState<{ estimatedAmount?: number; currency?: string } | null>(null);

  const loadSettings = useCallback(async () => {
    setSettingsStatus('loading');
    try {
      const result = await apiFetch<PlannerSettings>('/planner/settings');
      if (!result.data) throw new Error('Planner settings are missing');
      setSettings(result.data);
      setSelection((current) => ({ ...current, adults: Math.min(current.adults, result.data!.limits.maxAdults) }));
      setSettingsStatus('ready');
    } catch {
      setSettingsStatus('error');
    }
  }, []);

  const loadSource = useCallback(async (url: string) => {
    setSources((current) => ({ ...current, [url]: { status: 'loading', data: current[url]?.data || [] } }));
    try {
      const result = await apiFetch<Array<PlannerChoice | PlannerDestination>>(url);
      const rows = Array.isArray(result.data) ? result.data : [];
      const data = url === OPTION_ENDPOINTS.destination ? (rows as PlannerDestination[]).map(toChoice) : (rows as PlannerChoice[]);
      setSources((current) => ({ ...current, [url]: { status: 'ready', data } }));
    } catch (error) {
      setSources((current) => ({ ...current, [url]: { status: 'error', data: [], error: apiErrorMessage(error) } }));
    }
  }, []);

  useEffect(() => {
    if (!initialSettings) void loadSettings();
  }, [initialSettings, loadSettings]);

  const steps: PlannerStep[] = settings?.steps || [];
  const activitiesEnabled = steps.some((step) => step.key === 'activities');
  const currentIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const step = steps[currentIndex];

  useEffect(() => {
    if (settingsStatus !== 'ready') return;
    for (const item of steps) {
      if (isSingleStep(item.key) && !sources[OPTION_ENDPOINTS[item.key]]) void loadSource(OPTION_ENDPOINTS[item.key]);
    }
  }, [settingsStatus, steps, sources, loadSource]);

  useEffect(() => {
    if (!activitiesEnabled || !selection.destinationId) return;
    const url = activitiesEndpoint(selection.destinationId);
    if (!sources[url]) void loadSource(url);
  }, [activitiesEnabled, selection.destinationId, sources, loadSource]);

  useEffect(() => {
    if (!localStorage.getItem('ume_token')) return;
    apiFetch<{ name?: string; email?: string; phone?: string }>('/auth/me')
      .then(({ data }) => {
        if (!data) return;
        setContact((current) => ({
          ...current,
          name: current.name || data.name || '',
          email: current.email || data.email || '',
          phone: current.phone || data.phone || '',
        }));
      })
      .catch(() => undefined);
  }, []);

  const sourceUrl = (key: PlannerStepKey) => {
    if (isSingleStep(key)) return OPTION_ENDPOINTS[key];
    if (key === 'activities' && selection.destinationId) return activitiesEndpoint(selection.destinationId);
    return undefined;
  };
  const sourceFor = (key: PlannerStepKey) => {
    const url = sourceUrl(key);
    return url ? sources[url] : undefined;
  };
  const selectedOption = (key: SingleStepKey) => {
    const id = selection[SELECTION_FIELD[key]];
    return id ? sourceFor(key)?.data.find((item) => item.id === id) : undefined;
  };

  const activitySource = activitiesEnabled ? sourceFor('activities') : undefined;
  const selectedActivities = (activitySource?.data || []).filter((item) => selection.activityIds.includes(item.id));
  const limits = settings?.limits || { maxAdults: 1, maxChildren: 0 };
  const travellersValid =
    Number.isInteger(selection.adults) &&
    selection.adults >= 1 &&
    selection.adults <= limits.maxAdults &&
    Number.isInteger(selection.children) &&
    selection.children >= 0 &&
    selection.children <= limits.maxChildren;

  const resolved = {
    destination: selectedOption('destination'),
    duration: selectedOption('duration'),
    'travel-style': selectedOption('travel-style'),
    hotel: selectedOption('hotel'),
    transport: selectedOption('transport'),
  };

  const quoteRequest = useMemo(() => {
    if (!resolved.destination || !resolved.duration || !resolved['travel-style'] || !resolved.hotel || !resolved.transport) return null;
    if (!travellersValid) return null;
    return {
      destinationId: resolved.destination.id,
      durationId: resolved.duration.id,
      travelStyleId: resolved['travel-style'].id,
      hotelId: resolved.hotel.id,
      transportId: resolved.transport.id,
      activityIds: selectedActivities.map((item) => item.id),
      adults: selection.adults,
      children: selection.children,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resolved.destination?.id,
    resolved.duration?.id,
    resolved['travel-style']?.id,
    resolved.hotel?.id,
    resolved.transport?.id,
    selectedActivities.map((item) => item.id).join(','),
    selection.adults,
    selection.children,
    travellersValid,
  ]);
  const quoteKey = JSON.stringify(quoteRequest);

  useEffect(() => {
    const seq = ++quoteSeq.current;
    if (!quoteRequest) {
      setQuote(null);
      setQuoteStatus('idle');
      return;
    }
    setQuoteStatus('loading');
    const timer = window.setTimeout(async () => {
      try {
        const result = await apiFetch<PlannerQuote>('/planner/calculate', { method: 'POST', data: quoteRequest });
        if (seq !== quoteSeq.current) return;
        setQuote(result.data ?? null);
        setQuoteStatus('ready');
      } catch (error) {
        if (seq !== quoteSeq.current) return;
        setQuoteError(apiErrorMessage(error));
        setQuoteStatus('error');
      }
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey, quoteAttempt]);

  const chooseSingle = (key: SingleStepKey, id: string) => {
    setSelection((current) =>
      key === 'destination' && current.destinationId !== id
        ? { ...current, destinationId: id, activityIds: [] }
        : { ...current, [SELECTION_FIELD[key]]: id },
    );
  };

  const toggleActivity = (id: string) => {
    setSelection((current) => ({
      ...current,
      activityIds: current.activityIds.includes(id)
        ? current.activityIds.filter((item) => item !== id)
        : [...current.activityIds, id],
    }));
  };

  const canContinue = (key: PlannerStepKey | undefined) => {
    if (!key) return false;
    if (isSingleStep(key)) return sourceFor(key)?.status === 'ready' && Boolean(resolved[key]);
    if (key === 'activities') return activitySource?.status === 'ready';
    if (key === 'travellers') return travellersValid;
    return false;
  };

  const submit = async () => {
    if (!settings || !quoteRequest) return;
    const name = contact.name.trim();
    const email = contact.email.trim();
    const phone = contact.phone.trim();
    if (name.length < 2 || !email || !phone) {
      setSubmitError(settings.labels.contactRequired || '');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setSubmitError(settings.labels.invalidEmail || '');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await apiFetch<{ estimatedAmount?: number; currency?: string }>('/enquiries', {
        method: 'POST',
        data: {
          source: 'plan-your-trip',
          name,
          email,
          phone,
          message: contact.message.trim() || undefined,
          ...quoteRequest,
          estimatedAmount: quote?.estimatedTotal,
          plannerSnapshot: {
            destination: { id: resolved.destination!.id, name: resolved.destination!.name },
            duration: { id: resolved.duration!.id, label: resolved.duration!.label || resolved.duration!.name },
            travelStyle: { id: resolved['travel-style']!.id, name: resolved['travel-style']!.name },
            hotel: { id: resolved.hotel!.id, name: resolved.hotel!.name },
            transport: { id: resolved.transport!.id, name: resolved.transport!.name },
            activities: selectedActivities.map((item) => ({ id: item.id, name: item.name })),
          },
        },
      });
      setSubmitted(result.data ?? {});
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSelection(emptySelection(limits.maxAdults));
    setContact((current) => ({ ...current, message: '' }));
    setSubmitted(null);
    setSubmitError('');
    setStepIndex(0);
  };

  if (settingsStatus !== 'ready' || !settings) {
    return (
      <div className="rounded-3xl border border-[#e9e2dc] bg-white p-6 shadow-[0_12px_38px_rgba(27,25,23,0.04)] sm:p-8">
        {settingsStatus === 'error' ? (
          <div className="flex flex-col items-start gap-4 py-6">
            <p className="text-sm text-[#5f5751]">The trip planner could not be loaded.</p>
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e1da] px-5 py-3 text-sm text-[#615850] transition hover:border-[#b76b43]/40"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-[#b76b43]" aria-busy="true">
            <Loader2 className="animate-spin" size={22} />
          </div>
        )}
      </div>
    );
  }

  const { builder, summary, labels, success } = settings;
  const isLast = currentIndex === steps.length - 1;
  const nextIsDetails = steps[currentIndex + 1]?.key === 'details';

  const travellersText = `${selection.adults} ${summary.adultsLabel || ''}${
    selection.children ? ` · ${selection.children} ${summary.childrenLabel || ''}` : ''
  }`;

  const summaryValue = (key: PlannerStepKey) => {
    if (isSingleStep(key)) {
      const item = resolved[key];
      return item ? item.label || item.name : summary.notSelectedLabel;
    }
    if (key === 'activities') return selectedActivities.map((item) => item.name).join(', ') || summary.notSelectedLabel;
    if (key === 'travellers') return travellersText;
    return '';
  };

  const renderOptions = (key: PlannerStepKey) => {
    const source = sourceFor(key);
    if (!source || source.status === 'loading') {
      return (
        <div className="mt-6 grid gap-2 sm:grid-cols-2" aria-busy="true" aria-label={labels.loading}>
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[58px] animate-pulse rounded-2xl bg-[#f6f1ec]" />
          ))}
        </div>
      );
    }
    if (source.status === 'error') {
      return (
        <div className="mt-6 rounded-2xl border border-[#f0d9cc] bg-[#fff8f4] p-5 text-sm text-[#7c4a32]">
          <p>{labels.loadError}</p>
          <button
            type="button"
            onClick={() => {
              const url = sourceUrl(key);
              if (url) void loadSource(url);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#e8c9b7] bg-white px-4 py-2 text-xs font-semibold text-[#9c5735] transition hover:border-[#b76b43]"
          >
            <RefreshCw size={13} /> {labels.retry}
          </button>
        </div>
      );
    }
    if (!source.data.length) {
      return (
        <div className="mt-6 rounded-2xl border border-dashed border-[#e2d8cf] bg-[#fdfbf9] p-6 text-sm leading-6 text-[#7a7069]">
          {step?.emptyMessage || labels.unavailable}
        </div>
      );
    }

    return (
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {source.data.map((item) => {
          const active = key === 'activities' ? selection.activityIds.includes(item.id) : resolved[key as SingleStepKey]?.id === item.id;
          const Icon = item.icon ? PLANNER_ICONS[item.icon] : undefined;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => (key === 'activities' ? toggleActivity(item.id) : chooseSingle(key as SingleStepKey, item.id))}
              className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                active
                  ? 'border-[#b76b43] bg-[#fff4ed] font-semibold text-[#9c5735]'
                  : 'border-[#e8e1da] bg-white text-[#5f5751] hover:border-[#b76b43]/40 hover:bg-[#fffaf7]'
              }`}
            >
              <span className="flex items-start gap-3">
                {item.image && !Icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                ) : Icon ? (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#faf3ee] text-[#b76b43]">
                    <Icon size={17} strokeWidth={1.8} />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block">{item.label || item.name}</span>
                  {item.description ? (
                    <span className="mt-1 block text-xs font-normal leading-5 text-[#8b8179]">{item.description}</span>
                  ) : null}
                </span>
                {active ? <Check size={15} className="mt-0.5 shrink-0 text-[#b76b43]" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const counter = (label: string | undefined, value: number, min: number, max: number, onChange: (value: number) => void) => (
    <label className="text-xs font-semibold text-[#5f5751]">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Math.min(max, Math.max(min, Math.floor(Number(event.target.value)) || min)))}
        className="ml-3 inline-block w-20 rounded-xl border border-[#e8e1da] p-2"
      />
    </label>
  );

  const renderStepBody = () => {
    if (!step) return null;
    if (step.key === 'travellers') {
      return (
        <div className="mt-7 flex flex-wrap gap-6">
          {counter(summary.adultsLabel, selection.adults, 1, limits.maxAdults, (adults) => setSelection((current) => ({ ...current, adults })))}
          {limits.maxChildren > 0
            ? counter(summary.childrenLabel, selection.children, 0, limits.maxChildren, (children) =>
                setSelection((current) => ({ ...current, children })),
              )
            : null}
        </div>
      );
    }
    if (step.key === 'details') {
      return (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <input aria-label={labels.name} placeholder={labels.name} autoComplete="name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} className={INPUT} />
          <input aria-label={labels.email} placeholder={labels.email} type="email" autoComplete="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} className={INPUT} />
          <input aria-label={labels.phone} placeholder={labels.phone} type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} className={`${INPUT} sm:col-span-2`} />
          <textarea aria-label={labels.message} placeholder={labels.message} rows={3} maxLength={5000} value={contact.message} onChange={(event) => setContact({ ...contact, message: event.target.value })} className={`${INPUT} sm:col-span-2`} />
          {submitError ? <p className="text-sm text-red-600 sm:col-span-2" role="alert">{submitError}</p> : null}
        </div>
      );
    }
    if (step.key === 'activities' && !selection.destinationId) return null;
    return renderOptions(step.key);
  };

  const estimateAmount = submitted?.estimatedAmount ?? quote?.estimatedTotal;
  const estimateCurrency = submitted?.currency || quote?.currency || settings.pricing.currency;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-3xl border border-[#e9e2dc] bg-white p-6 shadow-[0_12px_38px_rgba(27,25,23,0.04)] sm:p-8">
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#b76b43] text-white">
              <Check />
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-[#a35b36]">{success.eyebrow}</p>
            <h2 className="mt-3 font-serif text-4xl">{success.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55">{success.description}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-7 rounded-full border border-[#e8e1da] px-6 py-3 text-sm text-[#615850] transition hover:border-[#b76b43]/40"
            >
              {success.resetLabel}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a35b36]">{builder.eyebrow}</p>
                <h1 className="mt-2 font-serif text-4xl">{builder.title}</h1>
              </div>
              <span className="text-xs text-black/40">
                {currentIndex + 1} / {steps.length}
              </span>
            </div>

            <div className="mb-7 h-1 overflow-hidden rounded-full bg-[#eee7e0]">
              <div
                className="h-full rounded-full bg-[#b76b43] transition-all"
                style={{ width: `${((currentIndex + 1) / Math.max(1, steps.length)) * 100}%` }}
              />
            </div>

            {step?.eyebrow ? <p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#a35b36]/80">{step.eyebrow}</p> : null}
            <h2 className="font-serif text-3xl">{step?.title}</h2>
            {step?.description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[#7a7069]">{step.description}</p> : null}

            {renderStepBody()}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0 || submitting}
                onClick={() => setStepIndex(Math.max(0, currentIndex - 1))}
                className="rounded-full border border-[#e8e1da] px-5 py-3 text-sm text-[#615850] transition hover:border-[#b76b43]/40 disabled:opacity-30"
              >
                {labels.back}
              </button>
              {isLast && step?.key === 'details' ? (
                <button
                  type="button"
                  disabled={submitting || !quoteRequest}
                  onClick={() => void submit()}
                  className="rounded-full bg-[#b76b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#934f30] disabled:opacity-40"
                >
                  {submitting ? labels.sending : labels.submit}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canContinue(step?.key)}
                  onClick={() => setStepIndex(Math.min(steps.length - 1, currentIndex + 1))}
                  className="rounded-full bg-[#b76b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#934f30] disabled:opacity-40"
                >
                  {nextIsDetails ? labels.request : labels.continue}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <aside className="h-fit rounded-3xl border border-[#e9e2dc] bg-[#fdfbf9] p-7 text-[#1b1917] shadow-[0_12px_38px_rgba(27,25,23,0.04)] lg:sticky lg:top-24">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a35b36]">{summary.eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl">{summary.title}</h2>
        <div className="mt-7 space-y-5 text-sm">
          {steps
            .filter((item) => item.key !== 'details')
            .map((item) => (
              <div key={item.key}>
                <p className="text-[10px] uppercase tracking-[.15em] text-[#9b9189]">{item.summaryLabel}</p>
                <p className="mt-1 text-[#5e5650]">{summaryValue(item.key)}</p>
              </div>
            ))}
        </div>
        <div className="mt-8 border-t border-[#e9e2dc] pt-6">
          <p className="text-[10px] uppercase tracking-[.15em] text-[#9b9189]">{summary.estimateLabel}</p>
          {quoteStatus === 'error' && !submitted ? (
            <div className="mt-2 text-xs text-[#7c4a32]">
              <p>{quoteError}</p>
              <button
                type="button"
                onClick={() => setQuoteAttempt((value) => value + 1)}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[#9c5735]"
              >
                <RefreshCw size={12} /> {labels.retry}
              </button>
            </div>
          ) : estimateAmount !== undefined && (quoteStatus !== 'idle' || submitted) ? (
            <p
              className={`mt-1 font-serif text-3xl text-[#9c5735] transition-opacity ${
                quoteStatus === 'loading' && !submitted ? 'opacity-40' : ''
              }`}
              aria-live="polite"
            >
              {formatPlannerAmount(estimateAmount, estimateCurrency)}
            </p>
          ) : quoteStatus === 'loading' ? (
            <Loader2 className="mt-2 animate-spin text-[#b76b43]" size={20} />
          ) : (
            <p className="mt-1 text-xs leading-5 text-[#8b8179]">{summary.estimatePendingLabel}</p>
          )}
          <p className="mt-1 text-xs text-[#8b8179]">{quote?.disclaimer || settings.pricing.disclaimer}</p>
        </div>
      </aside>
    </div>
  );
}
