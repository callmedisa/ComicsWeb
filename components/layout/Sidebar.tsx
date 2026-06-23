"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserProfile } from "@/lib/types";
import { logout } from "@/lib/api-client";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/comics", label: "My Comics", icon: "📚" },
  { href: "/create", label: "Create", icon: "✨" },
  { href: "/character", label: "Characters", icon: "🦸" },
  { href: "/achievements", label: "Achievements", icon: "🏆" },
];

export function Sidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-[236px] flex-shrink-0 flex-col border-r border-border bg-white px-4 py-6">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <span className="text-2xl">💬</span>
        <span className="font-display text-lg font-extrabold text-ink">
          ComicSpeak
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-btn px-3 py-2.5 font-body font-bold transition-colors ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted-2 hover:bg-page"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 rounded-btn bg-page px-3 py-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display font-bold text-white">
          {user.name[0]}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate font-display text-sm font-bold text-ink">
            {user.name}
          </div>
          <div className="text-xs text-muted">Level {user.level}</div>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="text-muted-2 hover:text-red-text"
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}
