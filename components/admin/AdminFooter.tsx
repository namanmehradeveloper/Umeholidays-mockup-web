export default function AdminFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-2 text-[11px] text-[#64748B] sm:flex-row">
        <p>© {new Date().getFullYear()} UME HOLIDAYS. All rights reserved.</p>
        <p>Admin Console</p>
      </div>
    </footer>
  );
}
