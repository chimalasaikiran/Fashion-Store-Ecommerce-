export default function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-[#E0E0E0] bg-white text-center text-xs text-[#797979] select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>&copy; {new Date().getFullYear()} Fashion Store Enterprise. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#terms" className="hover:underline">Terms of Service</a>
          <a href="#privacy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
