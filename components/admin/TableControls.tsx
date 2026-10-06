'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

import {
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import InputIcon from './InputIcon';

/* =========================================================
   COMMON
========================================================= */

const ROW_BTN =
  'inline-grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white ring-1 ring-inset transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76b43]/30';

const TOOLBAR_BTN =
  'relative inline-grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#64748B] ring-1 ring-inset ring-[#E2E8F0] transition-all duration-150 hover:bg-[#fff8f3] hover:text-[#b76b43] hover:ring-[#ead2c3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76b43]/30 disabled:cursor-not-allowed disabled:opacity-50';

const TONES = {
  default:
    'text-[#475569] ring-[#E2E8F0] hover:bg-[#fff8f3] hover:text-[#b76b43] hover:ring-[#ead2c3] disabled:hover:bg-white disabled:hover:text-[#475569]',

  primary:
    'text-[#b76b43] ring-[#ead2c3] hover:bg-[#fff8f3] hover:text-[#934f30] hover:ring-[#d9ad93] disabled:hover:bg-white',

  danger:
    'text-red-600 ring-red-200 hover:bg-red-50 hover:ring-red-300 disabled:hover:bg-white',
};

const ICON = {
  'aria-hidden': true,
  strokeWidth: 1.75,
  className: 'h-4 w-4',
} as const;

/* =========================================================
   SEARCH
========================================================= */

export function matchesQuery(
  query: string,
  ...values: unknown[]
) {
  const q = query.trim().toLowerCase();

  return (
    !q ||
    values.some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(q)
    )
  );
}

/* =========================================================
   COPY
========================================================= */

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   ICON ACTION
========================================================= */

type IconActionProps = {
  icon: LucideIcon;
  label: string;
  tone?: keyof typeof TONES;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  title?: string;
};

export function IconAction({
  icon: Icon,
  label,
  tone = 'default',
  onClick,
  href,
  disabled,
  title,
}: IconActionProps) {
  const className = `${ROW_BTN} ${TONES[tone]}`;

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={title || label}
        className={className}
      >
        <Icon {...ICON} />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
      className={className}
    >
      <Icon {...ICON} />
    </button>
  );
}

/* =========================================================
   POPOVER
========================================================= */

function usePopover(estimatedHeight: number) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] =
    useState<CSSProperties>({});

  const triggerRef =
    useRef<HTMLButtonElement>(null);

  const panelRef =
    useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }

    const rect =
      triggerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const right =
      document.documentElement.clientWidth -
      rect.right;

    const fitsBelow =
      window.innerHeight - rect.bottom >
      estimatedHeight;

    setStyle(
      fitsBelow
        ? {
            top: rect.bottom + 6,
            right,
          }
        : {
            bottom:
              window.innerHeight -
              rect.top +
              6,
            right,
          }
    );

    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);

    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close();
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    const onScroll = (event: Event) => {
      if (
        !panelRef.current?.contains(
          event.target as Node
        )
      ) {
        close();
      }
    };

    document.addEventListener(
      'mousedown',
      onPointer
    );

    document.addEventListener(
      'keydown',
      onKey
    );

    window.addEventListener(
      'resize',
      close
    );

    window.addEventListener(
      'scroll',
      onScroll,
      true
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        onPointer
      );

      document.removeEventListener(
        'keydown',
        onKey
      );

      window.removeEventListener(
        'resize',
        close
      );

      window.removeEventListener(
        'scroll',
        onScroll,
        true
      );
    };
  }, [open]);

  return {
    open,
    setOpen,
    style,
    toggle,
    triggerRef,
    panelRef,
  };
}

/* =========================================================
   MENU
========================================================= */

const PANEL =
  'fixed z-[60] min-w-[12rem] rounded-xl bg-white p-1 text-sm text-[#0F172A] shadow-[0_16px_40px_rgba(15,23,42,0.14)] ring-1 ring-[#E2E8F0]';

const MENU_ITEM =
  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#fff8f3]';

export type MoreItem = {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  copy?: string | (() => string);
  tone?: 'danger';
};

/* =========================================================
   MORE MENU
========================================================= */

export function MoreMenu({
  items,
  label = 'More actions',
}: {
  items: MoreItem[];
  label?: string;
}) {
  const {
    open,
    setOpen,
    style,
    toggle,
    triggerRef,
    panelRef,
  } = usePopover(items.length * 40 + 16);

  const [copied, setCopied] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCopied(null);
    }
  }, [open]);

  const run = async (item: MoreItem) => {
    if (item.copy !== undefined) {
      const value =
        typeof item.copy === 'function'
          ? item.copy()
          : item.copy;

      if (await copyText(value)) {
        setCopied(item.label);

        window.setTimeout(
          () => setOpen(false),
          900
        );
      }

      return;
    }

    setOpen(false);
    item.onClick?.();
  };

  if (!items.length) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`
          ${ROW_BTN}
          ${TONES.default}
          ${
            open
              ? 'bg-[#fff8f3] text-[#b76b43] ring-[#ead2c3]'
              : ''
          }
        `}
      >
        <MoreHorizontal {...ICON} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          style={style}
          className={PANEL}
        >
          {items.map((item) => {
            const Icon =
              copied === item.label
                ? Check
                : item.icon;

            const tone =
              item.tone === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : '';

            const content = (
              <>
                <Icon
                  aria-hidden
                  strokeWidth={1.75}
                  className={`
                    h-4 w-4
                    ${
                      copied === item.label
                        ? 'text-emerald-600'
                        : item.tone === 'danger'
                        ? ''
                        : 'text-[#6B7280]'
                    }
                  `}
                />

                <span>
                  {copied === item.label
                    ? 'Copied'
                    : item.label}
                </span>
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.label}
                  role="menuitem"
                  href={item.href}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={`${MENU_ITEM} ${tone}`}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => run(item)}
                className={`${MENU_ITEM} ${tone}`}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* =========================================================
   ROW ACTIONS
========================================================= */

type RowActionsProps = {
  onView?: () => void;
  viewHref?: string;
  viewDisabled?: string;

  onEdit?: () => void;

  onDelete?: () => void;
  deleteDisabled?: string;

  more?: MoreItem[];
};

export function RowActions({
  onView,
  viewHref,
  viewDisabled,
  onEdit,
  onDelete,
  deleteDisabled,
  more,
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {(onView ||
        viewHref !== undefined ||
        viewDisabled) && (
        <IconAction
          icon={Eye}
          label="View"
          tone="primary"
          href={viewHref}
          onClick={onView}
          disabled={Boolean(viewDisabled)}
          title={viewDisabled || 'View'}
        />
      )}

      {onEdit && (
        <IconAction
          icon={Pencil}
          label="Edit"
          onClick={onEdit}
        />
      )}

      {onDelete && (
        <IconAction
          icon={Trash2}
          label="Delete"
          tone="danger"
          onClick={onDelete}
          disabled={Boolean(deleteDisabled)}
          title={deleteDisabled || 'Delete'}
        />
      )}

      {more && (
        <MoreMenu items={more} />
      )}
    </div>
  );
}

/* =========================================================
   SEARCH FIELD
========================================================= */

export function SearchField({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <InputIcon
      icon={Search}
      className="min-w-0 flex-1"
    >
      <input
        type="search"
        {...props}
        className={`
          w-full
          rounded-xl
          border border-[#E5E7EB]
          bg-white
          py-3
          pl-10
          pr-4
          text-[#111827]
          outline-none
          transition
          focus:border-[#b76b43]
          ${className}
        `}
      />
    </InputIcon>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

export function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  spinning,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  spinning?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={TOOLBAR_BTN}
    >
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={`
          h-4 w-4
          ${spinning ? 'animate-spin' : ''}
        `}
      />
    </button>
  );
}

/* =========================================================
   REFRESH
========================================================= */

export function RefreshButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <ToolbarButton
      icon={RefreshCw}
      label="Refresh"
      onClick={onClick}
      disabled={loading}
      spinning={loading}
    />
  );
}

/* =========================================================
   FILTER MENU
========================================================= */

export type FilterOption = {
  value: string;
  label: string;
};

export function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const {
    open,
    setOpen,
    style,
    toggle,
    triggerRef,
    panelRef,
  } = usePopover(
    options.length * 40 + 48
  );

  const active = value !== 'all';

  const title = active
    ? `Filter: ${
        options.find(
          (option) =>
            option.value === value
        )?.label || value
      }`
    : `Filter by ${label.toLowerCase()}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={title}
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`
          ${TOOLBAR_BTN}
          ${
            open || active
              ? 'bg-[#fff8f3] text-[#b76b43] ring-[#ead2c3]'
              : ''
          }
        `}
      >
        <SlidersHorizontal
          aria-hidden
          strokeWidth={1.75}
          className="h-4 w-4"
        />

        {active && (
          <span
            aria-hidden
            className="
              absolute
              right-2.5
              top-2.5
              h-1.5
              w-1.5
              rounded-full
              bg-[#b76b43]
            "
          />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          style={style}
          className={PANEL}
        >
          <p
            className="
              px-3
              pb-1
              pt-2
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-[#6B7280]
            "
          >
            {label}
          </p>

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={
                option.value === value
              }
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`
                ${MENU_ITEM}
                justify-between
                capitalize
              `}
            >
              <span>{option.label}</span>

              {option.value === value && (
                <Check
                  aria-hidden
                  strokeWidth={2}
                  className="
                    h-4 w-4
                    text-[#b76b43]
                  "
                />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* =========================================================
   FULL DETAILS POPUP MODAL
========================================================= */

export function DetailsDialog({
  title,
  subtitle,
  rows,
  onClose,
}: {
  title: string;
  subtitle?: string;
  rows: Array<[string, ReactNode]>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      ).filter((element) => !element.hasAttribute('hidden'));

      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const isFullWidthField = (label: string, value: ReactNode) => {
    const normalized = label.toLowerCase().trim();
    const fullWidthLabels = [
      'description',
      'content',
      'body',
      'details',
      'message',
      'notes',
      'summary',
      'overview',
      'about',
      'html',
      'image',
      'banner',
      'video',
      'address',
      'special request',
      'cancellation reason',
    ];

    if (fullWidthLabels.some((item) => normalized.includes(item))) {
      return true;
    }

    return typeof value === 'string' && value.length > 180;
  };

  const isEmptyValue = (value: ReactNode) =>
    value === undefined || value === null || value === '';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#0F172A]/60 backdrop-blur-[4px]"
      />

      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-dialog-title"
        aria-describedby={subtitle ? 'details-dialog-subtitle' : undefined}
        className="relative z-10 flex max-h-[94vh] w-full max-w-[1380px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#F8FAFC] shadow-[0_30px_100px_rgba(15,23,42,0.35)] animate-[adminModalIn_250ms_cubic-bezier(0.22,1,0.36,1)] sm:max-h-[92vh] sm:rounded-[26px]"
      >
        <header className="relative z-30 shrink-0 border-b border-[#E2E8F0] bg-white/95 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff8f3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b76b43]">
                  <Eye aria-hidden strokeWidth={2} className="h-3.5 w-3.5" />
                  Full Details
                </span>

                <span className="hidden text-xs font-medium text-[#94A3B8] sm:inline">
                  Complete record information
                </span>
              </div>

              <h2
                id="details-dialog-title"
                title={title}
                className="break-words text-xl font-semibold tracking-tight text-[#0F172A] sm:text-2xl lg:text-[28px]"
              >
                {title}
              </h2>

              {subtitle && (
                <p
                  id="details-dialog-subtitle"
                  className="mt-1.5 max-w-4xl break-words text-sm leading-6 text-[#64748B] sm:text-[15px]"
                >
                  {subtitle}
                </p>
              )}
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close full details"
              title="Close"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#64748B] ring-1 ring-inset ring-[#E2E8F0] transition-all duration-200 hover:bg-[#F1F5F9] hover:text-[#0F172A] hover:ring-[#CBD5E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76b43]/30 sm:h-11 sm:w-11"
            >
              <X aria-hidden strokeWidth={1.8} className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-7">
          <div className="mx-auto w-full max-w-[1280px] space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl">
              <div className="bg-gradient-to-br from-[#F8FAFC] via-white to-[#fff8f3] px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#b76b43]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                    Record Overview
                  </span>
                </div>

                <h3 className="break-words text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl lg:text-[34px]">
                  {title}
                </h3>

                {subtitle && (
                  <p className="mt-2 max-w-5xl break-words text-sm leading-7 text-[#64748B] sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            </section>

            {rows.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center sm:rounded-3xl">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#F1F5F9] text-[#64748B]">
                  <Eye aria-hidden strokeWidth={1.7} className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#334155]">No details available</p>
                <p className="mt-1 text-xs text-[#94A3B8]">There is no additional data to display.</p>
              </section>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
                {rows.map(([label, value], index) => {
                  const empty = isEmptyValue(value);
                  const fullWidth = isFullWidthField(label, value);

                  return (
                    <section
                      key={`${label}-${index}`}
                      className={`min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition-all duration-200 hover:border-[#D5DDE8] hover:shadow-[0_6px_24px_rgba(15,23,42,0.055)] ${
                        fullWidth ? 'md:col-span-2' : ''
                      }`}
                    >
                      <div className="border-b border-[#EEF2F6] bg-[#FBFCFE] px-5 py-3.5 sm:px-6">
                        <h4 className="break-words text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                          {label}
                        </h4>
                      </div>

                      <div className="min-w-0 px-5 py-5 sm:px-6">
                        {empty ? (
                          <span className="text-sm italic text-[#94A3B8]">Not available</span>
                        ) : (
                          <div className="min-w-0 max-w-full break-words text-[14px] leading-7 text-[#1E293B] sm:text-[15px] [&_*]:max-w-full [&_a]:break-all [&_a]:font-medium [&_a]:text-[#b76b43] [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-[#0F172A] [&_b]:font-semibold [&_b]:text-[#0F172A] [&_p]:mb-3 [&_p]:leading-7 [&_p:last-child]:mb-0 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-[#0F172A] [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0F172A] [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0F172A] [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_li]:pl-1 [&_blockquote]:my-4 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#d9ad93] [&_blockquote]:bg-[#F8FAFC] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-[#475569] [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-[#E2E8F0] [&_img]:object-contain [&_video]:my-4 [&_video]:h-auto [&_video]:max-w-full [&_video]:rounded-xl [&_iframe]:my-4 [&_iframe]:max-w-full [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#E2E8F0] [&_th]:bg-[#F8FAFC] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-[#E2E8F0] [&_td]:px-3 [&_td]:py-2 [&_pre]:my-3 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0F172A] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white [&_code]:break-words">
                            {value}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#eadfd5] bg-[#fff9f5] px-5 py-5 text-[#1b1917] sm:rounded-3xl sm:px-7">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a35b36]">Full Record</p>
                  <p className="mt-1 text-sm leading-6 text-[#6d655f]">Complete record information is shown above.</p>
                </div>
                <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#eadfd5] bg-white text-[#b76b43] sm:grid">
                  <Eye aria-hidden strokeWidth={1.7} className="h-5 w-5" />
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="relative z-30 shrink-0 border-t border-[#E2E8F0] bg-white/95 px-4 py-3.5 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
            <p className="hidden items-center gap-1.5 text-xs text-[#94A3B8] sm:flex">
              Press
              <kbd className="inline-flex min-w-6 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B] shadow-sm">
                Esc
              </kbd>
              to close
            </p>

            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#b76b43] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#934f30] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76b43]/30"
            >
              <X aria-hidden strokeWidth={1.8} className="h-4 w-4" />
              Close
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
