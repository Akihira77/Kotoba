"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { APP_NAME, APP_NAME_JP, MOBILE_NAV, NAV_GROUPS, routeTitle } from "@/lib/constants";
import { stopAudio } from "@/lib/audio-player";
import { levelProgress } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { useProgress } from "./providers/progress-provider";
import { Icon } from "./icons";
import { Button, ProgressBar } from "./ui";

function subscribeSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (href === "/") return pathname === "/";
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5" aria-label="Navigasi utama">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-soft text-brand-strong dark:bg-brand/15 dark:text-brand"
                        : "text-muted hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                        active ? "bg-surface text-brand shadow-soft dark:bg-brand/20" : "bg-surface-2/70 text-muted group-hover:text-ink",
                      )}
                    >
                      <Icon name={item.icon} size={17} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {active ? <span className="h-1.5 w-1.5 rounded-full bg-brand" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} — beranda`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-soft">
        <Icon name="torii" size={22} />
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block text-base font-extrabold tracking-tight">{APP_NAME}</span>
          <span className="block text-[11px] font-medium text-muted"><span className="font-jp" lang="ja">{APP_NAME_JP}</span> · bahasa Jepang</span>
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { snapshot, loading, error, refresh } = useProgress();
  const [drawer, setDrawer] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const { saveSettings } = useProgress();

  const settings = snapshot.profile.settings;
  const systemDark = useSyncExternalStore(subscribeSystemTheme, getSystemDark, () => false);
  const isDark = settings.theme === "dark" || (settings.theme === "system" && systemDark);
  const level = levelProgress(snapshot.profile.xp);

  const pageTitle = useMemo(() => routeTitle(pathname), [pathname]);

  // Audio is global; navigating away must not leave a previous item speaking.
  useEffect(() => {
    stopAudio();
  }, [pathname]);

  useEffect(() => {
    if (!drawer) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : menuButtonRef.current;
    const panel = drawerRef.current;
    const focusables = () =>
      panel
        ? Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"))
        : [];
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawer(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      openerRef.current?.focus();
    };
  }, [drawer]);

  const toggleTheme = () => {
    void saveSettings({ theme: isDark ? "light" : "dark" });
  };

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
        Lompat ke konten utama
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/70 backdrop-blur lg:flex">
        <div className="px-5 pb-4 pt-6">
          <Brand />
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-2">
          <NavList pathname={pathname} />
        </div>
        <div className="m-3 rounded-2xl border border-line bg-surface p-3.5 shadow-soft">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-muted">
            <span>Level {level.level} · {level.title}</span>
            <span className="tnum">{Math.round(level.percent)}%</span>
          </div>
          <ProgressBar value={level.percent} label="Progres level" className="h-1.5" />
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
            <span className="tnum">{snapshot.profile.xp.toLocaleString("id-ID")} XP</span>
            <span className="inline-flex items-center gap-0.5 text-brand"><Icon name="flame" size={12} /> {snapshot.profile.streak} hari</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button
              ref={menuButtonRef}
              className="rounded-full p-2 text-ink hover:bg-surface-2 lg:hidden"
              onClick={() => setDrawer(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={drawer}
              aria-controls="mobile-drawer"
            >
              <Icon name="menu" size={22} />
            </button>
            <div className="lg:hidden"><Brand compact /></div>
            <div className="hidden items-baseline gap-2 lg:flex">
              <p className="text-base font-bold tracking-tight" aria-hidden="true">{pageTitle}</p>
              <span className="font-jp text-xs text-muted" lang="ja">日本語を学ぼう</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/progress"
                className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink sm:inline-flex"
              >
                <Icon name="flame" size={14} className="text-brand" />
                <span className="tnum">{snapshot.profile.streak}</span> hari
              </Link>
              <Link
                href="/progress"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand-strong transition-colors hover:brightness-[0.98] dark:bg-brand/15 dark:text-brand"
              >
                <Icon name="zap" size={14} />
                <span className="tnum">{loading ? "…" : snapshot.profile.xp.toLocaleString("id-ID")}</span> XP
              </Link>
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
                title={isDark ? "Tema terang" : "Tema gelap"}
              >
                <Icon name={isDark ? "sun" : "moon"} size={19} />
              </button>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-12">
          {error ? (
            <div
              role="alert"
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft/60 px-4 py-3 text-sm text-brand-strong dark:bg-brand/10 dark:text-brand"
            >
              <Icon name="alert" size={18} />
              <span className="min-w-0 flex-1">
                Perubahan terakhir belum tersimpan ke server lokal. Progres di peramban tetap aman.
              </span>
              <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                Coba lagi
              </Button>
            </div>
          ) : null}
          {children}
        </main>
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/45 backdrop-blur-sm" aria-label="Tutup menu" onClick={() => setDrawer(false)} />
          <div
            ref={drawerRef}
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-drawer-title"
            className="animate-fade-in relative flex h-full w-[84%] max-w-xs flex-col border-r border-line bg-surface shadow-lift"
          >
            <h2 id="mobile-drawer-title" className="sr-only">Menu navigasi {APP_NAME}</h2>
            <div className="flex items-center justify-between px-5 pb-4 pt-5">
              <Brand />
              <button
                ref={closeButtonRef}
                className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink"
                onClick={() => setDrawer(false)}
                aria-label="Tutup menu"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-2">
              <NavList pathname={pathname} onNavigate={() => setDrawer(false)} />
            </div>
            <div className="border-t border-line p-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Level {level.level} · {level.title}</span>
                <span className="tnum">{snapshot.profile.xp.toLocaleString("id-ID")} XP</span>
              </div>
              <ProgressBar value={level.percent} className="mt-2 h-1.5" label="Progres level" />
            </div>
          </div>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navigasi cepat"
      >
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                    active ? "text-brand" : "text-muted",
                  )}
                >
                  <span className={cn("rounded-xl p-1.5", active ? "bg-brand-soft dark:bg-brand/15" : "")}>
                    <Icon name={item.icon} size={20} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pointer-events-none fixed bottom-24 right-4 z-30 hidden lg:block">
        <Button
          variant="secondary"
          size="sm"
          className="pointer-events-auto rounded-full shadow-lift"
          onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
          aria-label="Kembali ke atas"
        >
          <Icon name="arrowUpRight" size={15} /> Atas
        </Button>
      </div>
    </div>
  );
}
