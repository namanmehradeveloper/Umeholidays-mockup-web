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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#0F172A]/50 backdrop-blur-[2px]"
      />

      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-dialog-title"
        aria-describedby={subtitle ? 'details-dialog-subtitle' : undefined}
        className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] animate-[adminModalIn_200ms_cubic-bezier(0.22,1,0.36,1)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="details-dialog-title"
              title={title}
              className="break-words text-lg font-semibold text-[#0F172A]"
            >
              {title}
            </h2>

            {subtitle && (
              <p
                id="details-dialog-subtitle"
                className="mt-0.5 break-words text-sm text-[#64748B]"
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
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76b43]/30"
          >
            <X aria-hidden strokeWidth={1.8} className="h-5 w-5" />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {rows.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#94A3B8]">
              No details available
            </p>
          ) : (
            <dl className="divide-y divide-[#F1F5F9]">
              {rows.map(([label, value], index) => {
                const empty = isEmptyValue(value);
                const stacked = isFullWidthField(label, value);

                return (
                  <div
                    key={`${label}-${index}`}
                    className={`px-5 py-3 sm:px-6 ${
                      stacked
                        ? 'space-y-1.5'
                        : 'grid grid-cols-1 gap-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4'
                    }`}
                  >
                    <dt className="break-words text-sm text-[#64748B]">
                      {label}
                    </dt>
                    <dd className="min-w-0 break-words text-sm font-medium leading-6 text-[#0F172A] [&_a]:break-all [&_a]:text-[#b76b43] [&_a]:underline [&_a]:underline-offset-2 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:font-normal [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:font-normal [&_img]:my-2 [&_img]:h-auto [&_img]:max-h-56 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:object-contain [&_video]:my-2 [&_video]:max-w-full [&_video]:rounded-lg [&_iframe]:max-w-full [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#E2E8F0] [&_th]:bg-[#F8FAFC] [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-[#E2E8F0] [&_td]:px-2 [&_td]:py-1 [&_td]:font-normal [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#0F172A] [&_pre]:p-3 [&_pre]:text-white">
                      {empty ? (
                        <span className="font-normal text-[#CBD5E1]">—</span>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </main>

        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E2E8F0] px-5 py-3 sm:px-6">
          <p className="hidden items-center gap-1.5 text-xs text-[#94A3B8] sm:flex">
            Press
            <kbd className="rounded border border-[#CBD5E1] bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
              Esc
            </kbd>
            to close
          </p>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg bg-[#b76b43] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#934f30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76b43]/30"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
