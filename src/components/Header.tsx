import { Logo } from "./Logo";

export function Header() {
  return (
    <header>
      <div className="flex items-center justify-between mb-6">
        <a href="/" className="hover:scale-95 transition-all duration-100">
          <Logo className="w-7 h-12" />
        </a>
        <nav className="flex items-center ml-auto text-lg font-medium space-x-4">
          <a href="/blog" className="hover:scale-95 transition-all duration-100">
            Blog
          </a>
        </nav>
      </div>
    </header>
  );
}
