"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowRight, ChevronRight, LayoutDashboard, LogOut, Menu, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { logoutAction } from "@/app/actions";
import { BrandLogo, BrandMark } from "@/components/brand-logo";
import { useCart } from "@/components/cart-provider";
import { ROLE_LABELS, type Role } from "@/lib/commerce";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/kemitraan", label: "Kemitraan" },
  { href: "/tentang", label: "Tentang Kami" },
];

const roleTone: Record<Role, string> = {
  consumer: "bg-slate-100 text-slate-600",
  reseller: "bg-emerald-50 text-emerald-800",
  agent: "bg-[#f6edda] text-[#8a6520]",
  distributor: "bg-[#e7eff8] text-[#28527c]",
  admin: "bg-navy text-gold-light",
};

export function SiteHeader({ user }: { user: { name: string; role: Role } | null }) {
  const pathname = usePathname();
  const { count, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  const activeIndex = useMemo(() => {
    const found = links.findIndex((link) => (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)));
    return found < 0 ? null : found;
  }, [pathname]);
  const target = hovered ?? activeIndex;
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? "U";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F5132] via-[#087F63] to-[#0F5132] px-4 py-2">
        <div className="islamic-pattern absolute inset-0 text-white opacity-[0.05]" />
        <div className="container-wide relative flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-white/85 sm:text-[11px]">
            <Sparkles size={12} className="shrink-0 text-gold-light" />
            <span className="truncate">Verifikasi pembayaran 1×24 jam · Pencairan komisi setiap Jumat</span>
          </p>
          <div className="hidden shrink-0 items-center gap-4 text-[10px] font-semibold tracking-wide text-white/70 md:flex">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gold-light" />Dari Umat, oleh Umat</span>
            <span className="h-3 w-px bg-white/25" />
            <Link href="/kemitraan#faq" className="transition hover:text-gold-light">Pusat Bantuan</Link>
            <span className="h-3 w-px bg-white/25" />
            <a href="mailto:salam@umanusa.id" className="transition hover:text-gold-light">salam@umanusa.id</a>
          </div>
        </div>
      </div>

      <header className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-navy/10 bg-[#fbfaf5]/92 shadow-[0_10px_40px_rgba(15,81,50,.09)] backdrop-blur-xl"
          : "border-transparent bg-[#fbfaf5]",
      )}>
        <div className="container-wide flex h-[74px] items-center justify-between gap-4">
          <Link href="/" aria-label="UMANUSA Beranda" className="group flex items-center gap-3">
            <BrandLogo />
            <span className="hidden h-8 w-px bg-navy/10 xl:block" />
            <span className="hidden max-w-[150px] flex-col gap-1 xl:flex">
              <span className="text-[9px] font-bold uppercase tracking-[.18em] text-gold">Ekosistem</span>
              <span className="text-[10px] font-semibold leading-none text-slate-500">Ekonomi Umat Nusantara</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-navy/8 bg-white/70 p-1.5 shadow-[0_4px_16px_rgba(21,44,66,.04)] lg:flex" aria-label="Navigasi utama" onMouseLeave={() => setHovered(null)}>
            {links.map((link, index) => {
              const active = activeIndex === index;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(index)}
                  onFocus={() => setHovered(index)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors duration-200",
                    active || target === index ? "text-emerald-900" : "text-slate-500 hover:text-emerald-900",
                  )}
                >
                  {target === index && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full border border-emerald-800/10 bg-emerald-800/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {active && target !== index && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="group relative grid h-11 w-11 place-items-center rounded-full border border-navy/8 bg-white text-navy transition hover:border-emerald-700/40 hover:text-emerald-800"
              aria-label={`Keranjang, ${count} item`}
            >
              <ShoppingBag size={18} className="transition group-hover:scale-110" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full border-2 border-[#fbfaf5] bg-gold px-1 text-[10px] font-black text-navy"
                  >
                    {count > 9 ? "9+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <Link
                href={user.role === "admin" ? "/dashboard/admin" : "/dashboard"}
                className="group hidden items-center gap-2.5 rounded-full border border-navy/8 bg-white py-1.5 pl-1.5 pr-4 text-left transition hover:border-emerald-700/40 hover:shadow-[0_6px_20px_rgba(15,81,50,.08)] sm:flex"
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-black", roleTone[user.role])}>{initial}</span>
                <span className="min-w-0 leading-none">
                  <span className="block max-w-24 truncate text-[11.5px] font-bold text-navy">{user.name.split(" ")[0]}</span>
                  <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wider text-slate-400">{ROLE_LABELS[user.role]}</span>
                </span>
                <ChevronRight size={14} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </Link>
            ) : (
              <Link href="/masuk" className="hidden items-center gap-2 rounded-full border border-navy/12 px-4 py-2.5 text-[11.5px] font-bold text-navy transition hover:border-emerald-700 hover:bg-white hover:text-emerald-800 sm:flex">
                <UserRound size={15} /> Masuk
              </Link>
            )}

            <Link href="/gabung" className="button-primary group hidden !min-h-11 !px-5 !text-[11.5px] md:inline-flex">
              Gabung Sekarang <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid h-11 w-11 place-items-center rounded-full border border-navy/8 bg-white text-navy transition lg:hidden"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={menuOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <motion.div style={{ scaleX: progress }} className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-emerald-700 via-gold to-gold-light" />

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-navy/10 bg-[#fbfaf5] lg:hidden"
            >
              <div className="relative max-h-[calc(100vh-140px)] overflow-y-auto">
                <div className="islamic-pattern absolute inset-0 text-emerald-900 opacity-[0.025]" />
                <nav className="container-wide relative flex flex-col py-5" aria-label="Menu seluler">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">Navigasi</p>
                  {links.map((link, index) => {
                    const active = activeIndex === index;
                    return (
                      <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + index * 0.05, duration: 0.35 }}>
                        <Link href={link.href} className={cn("flex items-center justify-between border-b border-navy/8 py-4 font-serif text-xl transition", active ? "text-emerald-800" : "text-navy")}>
                          <span className="flex items-center gap-3">
                            <span className={cn("font-sans text-[10px] font-black tracking-widest", active ? "text-gold" : "text-slate-300")}>0{index + 1}</span>
                            {link.label}
                          </span>
                          <ChevronRight size={17} className={active ? "text-gold" : "text-emerald-700/50"} />
                        </Link>
                      </motion.div>
                    );
                  })}

                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.35 }} className="mt-6 rounded-2xl border border-navy/10 bg-white p-4">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3">
                          <span className={cn("grid h-10 w-10 place-items-center rounded-full text-xs font-black", roleTone[user.role])}>{initial}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-navy">{user.name}</p>
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{ROLE_LABELS[user.role]}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Link href={user.role === "admin" ? "/dashboard/admin" : "/dashboard"} className="button-secondary !min-h-10 !px-3 !text-[11px]"><LayoutDashboard size={14} />Dashboard</Link>
                          <form action={logoutAction}><button className="button-secondary !min-h-10 !px-3 !text-[11px] !text-red-600"><LogOut size={14} />Keluar</button></form>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sudah menjadi mitra?</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Link href="/masuk" className="button-secondary !min-h-10 !px-3 !text-[11px]"><UserRound size={14} />Masuk</Link>
                          <Link href="/dashboard" className="button-secondary !min-h-10 !px-3 !text-[11px]"><LayoutDashboard size={14} />Dashboard</Link>
                        </div>
                      </>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.35 }} className="mt-3">
                    <Link href="/gabung" className="button-primary w-full">Gabung Sekarang <ArrowRight size={16} /></Link>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400">
                      <Link href="/kemitraan#faq" className="transition hover:text-emerald-800">Pusat Bantuan</Link>
                      <a href="mailto:salam@umanusa.id" className="transition hover:text-emerald-800">salam@umanusa.id</a>
                      <span>umanusa.id</span>
                    </div>
                  </motion.div>
                </nav>
                <BrandMark className="pointer-events-none absolute -bottom-6 -right-8 h-36 w-32 text-emerald-950/[0.04]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
