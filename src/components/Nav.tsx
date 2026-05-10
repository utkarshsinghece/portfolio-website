import { Link } from "@tanstack/react-router";

export function Nav({ showHireMe = false }: { showHireMe?: boolean }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 sm:pt-5">
        <nav className="glass flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background font-display font-bold">
              U
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition">About</a>
            <a href="#skills" className="hover:text-foreground transition">Skills</a>
            <a href="#experience" className="hover:text-foreground transition">Experience</a>
            <a href="#contact" className="hover:text-foreground transition">Contact</a>
          </div>

          {showHireMe ? (
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition"
            >
              Hire me
            </a>
          ) : (
            <span className="w-8" aria-hidden />
          )}
        </nav>
      </div>
    </header>
  );
}
