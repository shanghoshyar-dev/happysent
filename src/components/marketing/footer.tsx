import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-candy-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-xl">🎂</span>
            <span className="font-script text-xl font-normal text-slate-900">
              Happysent
            </span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/om-oss" className="hover:text-candy-600">
            Om oss
          </Link>
          <Link href="/hur-det-fungerar" className="hover:text-candy-600">
            Hur det fungerar
          </Link>
          <Link href="/priser" className="hover:text-candy-600">
            Priser
          </Link>
          <Link href="/blogg" className="hover:text-candy-600">
            Blogg
          </Link>
          <Link href="/kontakt" className="hover:text-candy-600">
            Kontakt
          </Link>
          <Link href="/integritetspolicy" className="hover:text-candy-600">
            Privacy policy
          </Link>
          <Link href="/anvandarvillkor" className="hover:text-candy-600">
            Användarvillkor
          </Link>
          <Link href="/login" className="hover:text-candy-600">
            Logga in
          </Link>
        </nav>
        <div className="flex flex-col gap-1 text-right md:text-left">
          <a
            href="mailto:info@happysent.com"
            className="font-medium text-slate-700 hover:text-candy-600"
          >
            info@happysent.com
          </a>
          <p>&copy; {new Date().getFullYear()} Happysent</p>
        </div>
      </div>
    </footer>
  );
}
