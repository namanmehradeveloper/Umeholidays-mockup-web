export default function SectionHeading({
  eyebrow,
  title,
  text,
  light = false,
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  light?: boolean;
}) {
  if (!eyebrow && !title && !text) return null;

  return (
    <div
      className={`max-w-2xl ${
        light ? 'text-[#f7f1e7]' : 'text-[#1b1917]'
      }`}
    >
      {eyebrow && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a35b36]">
          {eyebrow}
        </p>
      )}

      {title && (
        <h2 className="font-serif text-4xl leading-[0.98] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      )}

      {text && (
        <p
          className={`mt-5 text-base leading-7 ${
            light ? 'text-white/65' : 'text-black/60'
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
