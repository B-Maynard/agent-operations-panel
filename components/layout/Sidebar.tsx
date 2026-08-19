'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/inspector', label: 'Inspector' },
  { href: '/fanout', label: 'Fan-out' },
  { href: '/agents', label: 'Agents' },
  { href: '/templates', label: 'Templates' },
]

export function Sidebar() {
  const pathname = usePathname()
  const linkClass = (active: boolean) =>
    active
      ? 'bg-[rgba(88,166,255,0.15)] text-[#58a6ff]'
      : 'text-[#8b949e] hover:bg-[rgba(88,166,255,0.08)] hover:text-[#e6edf3]'

  return (
    <>
      <aside className="hidden w-52 shrink-0 flex-col border-r border-[#30363d] bg-[#161b22] md:flex">
        <div className="border-b border-[#30363d] px-5 py-4 text-base font-semibold text-[#e6edf3]">
          ◈ Agent <span className="text-[#58a6ff]">Panel</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${linkClass(active)}`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#30363d] bg-[#161b22] md:hidden">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex min-h-11 min-w-0 flex-1 items-center justify-center text-xs font-semibold transition-colors ${linkClass(active)}`}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}