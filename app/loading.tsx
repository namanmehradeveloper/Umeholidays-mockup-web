export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <div
        className="
          h-9
          w-9
          animate-spin
          rounded-full
          border-2
          border-[#E5E7EB]
          border-t-[#B76B43]
        "
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}