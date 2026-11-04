"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Check, Crown, Network, ShoppingBag, Store } from "lucide-react";
import { useRef } from "react";
import { TIER_RULES, formatCompactRupiah } from "@/lib/commerce";

const icons = [ShoppingBag, Store, Network, Crown];
const positions = [
  { startX: -420, endX: -270, endY: 95, rotate: -7 },
  { startX: -140, endX: -90, endY: 25, rotate: 5 },
  { startX: 140, endX: 90, endY: -45, rotate: -5 },
  { startX: 420, endX: 270, endY: -115, rotate: 7 },
];

function JourneyCard({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const tier = TIER_RULES[index];
  const Icon = icons[index];
  const pos = positions[index];
  const x = useTransform(progress, [0, .48, 1], [pos.startX, 0, pos.endX]);
  const y = useTransform(progress, [0, .48, 1], [0, index * 9 - 14, pos.endY]);
  const rotate = useTransform(progress, [0, .48, 1], [0, 0, pos.rotate]);
  const scale = useTransform(progress, [0, .48, 1], [.86, .72, 1]);
  const opacity = useTransform(progress, [0, .12, .48, .65, 1], [.4, 1, .75, 1, 1]);
  return (
    <motion.div style={{ x, y, rotate, scale, opacity, zIndex: index + 1 }} className={`absolute left-1/2 top-1/2 -ml-[130px] -mt-[110px] w-[260px] rounded-3xl border p-5 shadow-2xl ${index === 3 ? "border-gold/60 bg-[#163d34] text-white" : "border-navy/10 bg-[#fbfaf5] text-navy"}`}>
      <div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${index === 3 ? "bg-gold text-navy" : "bg-emerald-800 text-white"}`}><Icon size={18} /></span><span className={`font-serif text-4xl ${index === 3 ? "text-white/10" : "text-navy/10"}`}>0{index + 1}</span></div>
      <h3 className="mt-5 font-serif text-2xl font-semibold">{tier.name}</h3>
      <p className={`mt-2 min-h-12 text-[11px] leading-5 ${index === 3 ? "text-white/60" : "text-slate-500"}`}>{tier.benefit}</p>
      <div className={`mt-4 border-t pt-3 text-[10px] ${index === 3 ? "border-white/15 text-gold-light" : "border-navy/10 text-emerald-800"}`}>{tier.threshold ? `Syarat omzet ${formatCompactRupiah(tier.threshold)}` : index === 0 ? "Terbuka untuk semua" : "Mulai tanpa target awal"}</div>
    </motion.div>
  );
}

export function TierJourney() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const titleScale = useTransform(scrollYProgress, [0, .5, 1], [.85, 1.2, .95]);
  const titleOpacity = useTransform(scrollYProgress, [0, .5, 1], [.08, .035, .07]);
  const lineScale = useTransform(scrollYProgress, [.55, 1], [0, 1]);

  return (
    <>
      <section ref={ref} className="tier-scroll-scene relative hidden h-[250vh] bg-[#0d2d27] text-white lg:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="islamic-pattern absolute inset-0 text-white opacity-[0.025]" />
          <div className="container-wide relative flex h-full flex-col pt-16">
            <div className="relative z-20 mx-auto max-w-xl text-center"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-gold">Satu ekosistem · Empat jenjang</p><h2 className="mt-3 font-serif text-4xl leading-tight">Bertumbuh dengan arah,<br /><span className="italic text-gold-light">bukan sendirian.</span></h2></div>
            <motion.p style={{ scale: titleScale, opacity: titleOpacity }} className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-serif text-[12vw] font-bold">BERTUMBUH</motion.p>
            <div className="relative flex-1">
              <motion.div style={{ scaleX: lineScale }} className="absolute left-[19%] right-[19%] top-[55%] h-px origin-left -rotate-[16deg] bg-gradient-to-r from-emerald-500 via-gold to-gold-light" />
              {TIER_RULES.map((tier, index) => <JourneyCard key={tier.role} index={index} progress={scrollYProgress} />)}
            </div>
            <div className="relative z-20 mx-auto mb-9 flex items-center gap-5 rounded-full border border-white/10 bg-white/5 py-2 pl-5 pr-2 text-[11px] text-white/60 backdrop-blur">Harga menyesuaikan level · Kenaikan level disetujui Admin <Link href="/kemitraan" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 font-bold text-navy">Lihat skema <ArrowRight size={13} /></Link></div>
          </div>
        </div>
      </section>
      <section className="tier-mobile bg-[#0d2d27] px-4 py-20 text-white lg:hidden">
        <div className="mx-auto max-w-lg"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">Satu ekosistem · Empat jenjang</p><h2 className="mt-3 font-serif text-4xl">Bertumbuh dengan arah.</h2><div className="mt-10 space-y-4">{TIER_RULES.map((tier, index) => { const Icon = icons[index]; return <div key={tier.role} className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700"><Icon size={18} /></span><div><h3 className="font-serif text-xl">{tier.name}</h3><p className="text-[10px] text-gold">{tier.threshold ? `Omzet ${formatCompactRupiah(tier.threshold)}` : "Terbuka untuk memulai"}</p></div></div><p className="mt-4 text-xs leading-6 text-white/60">{tier.benefit}</p></div>; })}</div><Link href="/kemitraan" className="button-gold mt-7 w-full">Pelajari kemitraan <ArrowRight size={16} /></Link></div>
      </section>
      {reduce && <span className="sr-only">Jenjang kemitraan: Konsumen, Reseller, Agen, dan Distributor.</span>}
    </>
  );
}
