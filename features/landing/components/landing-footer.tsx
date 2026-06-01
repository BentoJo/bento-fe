import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/features/landing/data/content";

interface LandingFooterProps {
  isAuthenticated: boolean;
}

export function LandingFooter({ isAuthenticated }: LandingFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#020617]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Image
              src="/logo.svg"
              alt="ManeJo"
              width={130}
              height={32}
              className="h-7 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
              Manage Jordan — a passwordless, Kanban-first platform to plan
              work, organize teams, and ship together.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <h3 className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Account</h3>
              <ul className="mt-4 space-y-3">
                {isAuthenticated ? (
                  <li>
                    <Link
                      href="/home"
                      className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                    >
                      Open App
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/auth/login"
                        className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                      >
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/auth/register"
                        className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                      >
                        Get started
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-[#64748B] sm:flex-row">
          <p>&copy; 2026 ManeJo. All rights reserved.</p>
          <p>Passwordless · Role-based · Real-time</p>
        </div>
      </div>
    </footer>
  );
}
