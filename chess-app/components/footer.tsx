import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Chess98. Created by Wilfredo Paiz.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

