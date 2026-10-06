import Link from 'next/link';

export function Button({
  children,
  href,
  className = '',
  variant = 'dark',
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  variant?: 'dark' | 'light' | 'outline';
}) {
  const styles =
    variant === 'dark'
      ? 'bg-[#b76b43] text-white hover:bg-[#934f30]'
      : variant === 'light'
        ? 'border border-[#e8e1da] bg-white text-[#1b1917] hover:border-[#b76b43]/40 hover:bg-[#fff9f5] hover:text-[#9c5735]'
        : 'border border-[#b76b43] bg-white text-[#9c5735] hover:bg-[#fff9f5]';

  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium tracking-wide transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76b43] ${styles} ${className}`;

  return href ? <Link href={href} className={classes}>{children}</Link> : <button className={classes}>{children}</button>;
}
