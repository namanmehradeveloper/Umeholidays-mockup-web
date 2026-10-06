import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Reusable input/textarea icon wrapper.
 *
 * The wrapped input or textarea must reserve left space
 * with `pl-10` so the icon does not overlap the text.
 */
type InputIconProps = {
  icon: LucideIcon;
  multiline?: boolean;
  className?: string;
  children: ReactNode;
};

export default function InputIcon({
  icon: Icon,
  multiline = false,
  className = '',
  children,
}: InputIconProps) {
  return (
    <div className={`group relative w-full ${className}`}>
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={[
          'pointer-events-none absolute left-3.5 z-[1] h-4 w-4',
          'text-[#9CA3AF] transition-colors duration-200',
          'group-focus-within:text-[#111827]',
          multiline
            ? 'top-4'
            : 'top-1/2 -translate-y-1/2',
        ].join(' ')}
      />

      {children}
    </div>
  );
}