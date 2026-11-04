"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, BadgeCheck, CircleDollarSign, Network, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { formatCompactRupiah } from "@/lib/commerce";

export function HomeHero({ metrics }: { metrics: { partners: number; products: number; omzet: number; bonus: number } }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.03, reduce ? 1.03 : 1.22]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, .72], [1, reduce ? 1 : 0]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const enter = (delay: number) => ({ initial: reduce ? { opacity: 1 } : { opacity: 0, y: 45 }, animate: { opacity: 1, y: 0 }, transition: { duration: .9, delay, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <section ref={ref} className="relative min-h-[calc(100svh-108px)] overflow-hidden bg-[#0a342b] text-white">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        <Image src="/images/umanusa-hero.jpg" alt="Bentang alam Nusantara dan masjid di antara persawahan" fill priority className="object-cover object-center" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,37,30,.97)_0%,rgba(7,48,38,.86)_43%,rgba(7,43,35,.28)_76%,rgba(7,43,35,.25)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,31,27,.72)_0%,transparent_45%)]" />
      <div className="islamic-pattern absolute inset-y-0 left-0 w-[48%] text-white opacity-[0.035]" />
      <motion.div animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-gold/20"><div className="absolute inset-12 rounded-full border border-gold/10" /><div className="absolute inset-28 rounded-full border border-white/10" /></motion.div>

      <div className="container-wide relative grid min-h-[calc(100svh-108px)] items-center gap-12 py-16 lg:grid-cols-[1.18fr_.82fr] lg:py-20">
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 max-w-3xl">
          <motion.div {...enter(.08)} className="flex items-center gap-3">
            <span className="gold-line" /><p className="text-[10px] font-bold uppercase tracking-[.24em] text-gold-light">Ekosistem Ekonomi Umat</p><span className="hidden h-px w-16 bg-white/20 sm:block" /><p className="hidden text-[10px] tracking-widest text-white/50 sm:block">UMANUSA.ID</p>
          </motion.div>
          <h1 className="mt-7 font-serif text-[clamp(3.5rem,7.2vw,7.15rem)] font-medium leading-[.88] tracking-[-.055em]">
            <span className="block overflow-hidden pb-2"><motion.span {...enter(.16)} className="block">Umat Berdaya,</motion.span></span>
            <span className="block overflow-hidden pb-2"><motion.span {...enter(.27)} className="block text-[#e3c979]">Nusantara</motion.span></span>
            <span className="block overflow-hidden pb-3"><motion.span {...enter(.38)} className="block">Sejahtera.</motion.span></span>
          </h1>
          <motion.p {...enter(.5)} className="mt-6 max-w-xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">Menghubungkan produk halal, UMKM, dan mitra penjualan dalam satu ekosistem yang amanah. Pusat mengelola produk dan stok—Anda fokus bertumbuh.</motion.p>
          <motion.div {...enter(.6)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/gabung" className="button-gold !min-h-[54px] !px-7">Gabung Sekarang <ArrowRight size={18} /></Link>
            <Link href="/katalog" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-sm font-bold text-white transition hover:border-gold hover:text-gold-light">Jelajahi Produk <PackageCheck size={17} /></Link>
          </motion.div>
          <motion.div {...enter(.7)} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-6 text-xs text-white/65">
            <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-gold" />Pembayaran terverifikasi</span>
            <span className="flex items-center gap-2"><BadgeCheck size={15} className="text-gold" />Produk terkurasi pusat</span>
            <span className="flex items-center gap-2"><Network size={15} className="text-gold" />Jaringan tercatat sistem</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: dashboardY }} initial={reduce ? { opacity: 1 } : { opacity: 0, x: 70, rotateY: -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 1.1, delay: .55, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto hidden w-full max-w-[400px] lg:block">
          <div className="absolute -inset-8 rounded-full bg-gold/15 blur-3xl" />
          <div className="glass relative overflow-hidden rounded-[1.75rem] p-5 shadow-[0_35px_90px_rgba(0,0,0,.35)]">
            <div className="flex items-center justify-between border-b border-white/15 pb-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-white/50">Ekosistem hari ini</p><p className="mt-1 font-serif text-lg">Bertumbuh bersama</p></div><span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-bold text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Aktif</span></div>
            <div className="grid grid-cols-2 gap-3 py-5">
              <div className="rounded-2xl bg-white/10 p-4"><CircleDollarSign className="text-gold" size={19} /><p className="mt-4 text-[10px] text-white/50">Omzet terverifikasi</p><p className="mt-1 font-serif text-2xl">{formatCompactRupiah(metrics.omzet)}</p><p className="mt-1 text-[9px] text-emerald-200">Tercatat dari pesanan lunas</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><TrendingUp className="text-gold" size={19} /><p className="mt-4 text-[10px] text-white/50">Bonus disalurkan</p><p className="mt-1 font-serif text-2xl">{formatCompactRupiah(metrics.bonus)}</p><p className="mt-1 text-[9px] text-emerald-200">Buku saldo digital mitra</p></div>
            </div>
            <div className="rounded-2xl bg-[#f8f5e9] p-4 text-navy">
              <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Aktivitas jaringan</p><Network size={17} className="text-emerald-800" /></div>
              <div className="mt-5 flex items-end justify-between gap-5"><div><p className="font-serif text-3xl font-bold">{metrics.partners}</p><p className="text-[10px] text-slate-500">pengguna terhubung</p></div><div className="flex h-12 flex-1 items-end gap-1.5">{[38, 55, 46, 70, 63, 84, 100].map((height, i) => <motion.span key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: 1 + i * .08, duration: .6 }} className={`flex-1 rounded-t ${i === 6 ? "bg-gold" : "bg-emerald-700/65"}`} />)}</div></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/55"><span>{metrics.products} produk terkurasi pusat</span><span className="flex items-center gap-1 text-gold-light">Amanah <BadgeCheck size={12} /></span></div>
          </div>
          <div className="animate-float-soft absolute -bottom-7 -left-12 flex items-center gap-3 rounded-2xl bg-white p-3.5 pr-5 text-navy shadow-2xl"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800 text-white"><PackageCheck size={19} /></span><div><p className="text-xs font-bold">Stok terpusat</p><p className="mt-0.5 text-[10px] text-slate-500">Mitra fokus berjualan</p></div></div>
        </motion.div>
      </div>
      <motion.a href="#ekosistem" aria-label="Gulir ke ekosistem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[.2em] text-white/45 md:flex"><span>Gulir untuk berdaya</span><ArrowDown size={14} className="animate-bounce" /></motion.a>
    </section>
  );
}
