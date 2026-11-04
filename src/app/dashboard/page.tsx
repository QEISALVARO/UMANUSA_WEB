import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { ArrowRight, CheckCircle2, Coins, Package, ShoppingBag, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { db } from "@/db";
import { bonusLedger, orders, users, withdrawals } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatCompactRupiah, formatDate, formatRupiah, nextTier, ROLE_LABELS } from "@/lib/commerce";
import { StatusBadge } from "@/components/order-ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ selamat?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role === "admin") redirect("/dashboard/admin");
  const { selamat } = await searchParams;
  const [orderCount] = await db.select({ value: sql<number>`count(*)::int` }).from(orders).where(eq(orders.userId, user.id));
  const [bonus] = await db.select({ value: sql<number>`coalesce(sum(${bonusLedger.amount}),0)::int` }).from(bonusLedger).where(eq(bonusLedger.userId, user.id));
  const [withdrawn] = await db.select({ value: sql<number>`coalesce(sum(${withdrawals.amount}),0)::int` }).from(withdrawals).where(and(eq(withdrawals.userId, user.id), inArray(withdrawals.status, ["pending", "paid"])));
  const recent = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(5);
  const tier = nextTier(user.role);
  const progress = tier?.threshold ? Math.min(100, Math.round((user.totalOmzet / tier.threshold) * 100)) : 100;
  const isPartner = user.role !== "consumer";
  return (
    <div className="space-y-6">
      {selamat && <div className="form-success flex items-center gap-3"><CheckCircle2 size={18} />Akun berhasil dibuat. Selamat datang di ekosistem UMANUSA!</div>}
      <section className="relative overflow-hidden rounded-2xl bg-[#0d352c] p-6 text-white sm:p-8"><div className="islamic-pattern absolute inset-0 text-white opacity-[.03]" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] uppercase tracking-[.18em] text-gold">Assalamu’alaikum, {user.name.split(" ")[0]}</p><h1 className="mt-3 font-serif text-3xl sm:text-4xl">Apa langkah baik Anda hari ini?</h1><p className="mt-3 text-xs leading-6 text-white/55">Pantau transaksi dan kembangkan manfaat dari satu ruang kerja.</p></div><Link href="/katalog" className="button-gold shrink-0"><ShoppingBag size={16} />Belanja Produk</Link></div></section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="stat-card"><Package className="text-emerald-700" size={20} /><p className="mt-4 text-[10px] text-slate-500">Total pesanan</p><p className="mt-1 font-serif text-3xl font-bold">{orderCount.value}</p><Link href="/dashboard/pesanan" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800">Lihat semua <ArrowRight size={11} /></Link></div><div className="stat-card"><TrendingUp className="text-emerald-700" size={20} /><p className="mt-4 text-[10px] text-slate-500">Omzet terverifikasi</p><p className="mt-1 font-serif text-3xl font-bold">{formatCompactRupiah(user.totalOmzet)}</p><p className="mt-3 text-[10px] text-slate-400">Dari pesanan lunas</p></div>{isPartner ? <><div className="stat-card"><Coins className="text-gold" size={20} /><p className="mt-4 text-[10px] text-slate-500">Total bonus tercatat</p><p className="mt-1 font-serif text-3xl font-bold">{formatCompactRupiah(bonus.value)}</p><p className="mt-3 text-[10px] text-slate-400">Dari selisih harga jaringan</p></div><div className="stat-card"><WalletCards className="text-gold" size={20} /><p className="mt-4 text-[10px] text-slate-500">Saldo tersedia</p><p className="mt-1 font-serif text-3xl font-bold">{formatCompactRupiah(bonus.value - withdrawn.value)}</p><Link href="/dashboard/bonus" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800">Kelola saldo <ArrowRight size={11} /></Link></div></> : <div className="stat-card sm:col-span-2"><Sparkles className="text-gold" size={20} /><p className="mt-4 text-xs font-bold">Ingin harga yang lebih hemat?</p><p className="mt-2 text-[10px] leading-5 text-slate-500">Daftarkan diri sebagai Reseller melalui Admin untuk mengaktifkan harga mitra dan saldo bonus.</p></div>}</section>
      {tier && <section className="rounded-2xl border border-navy/10 bg-white p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Progres menuju {tier.name}</p><h2 className="mt-2 font-serif text-2xl">{formatRupiah(user.totalOmzet)} <span className="text-base font-normal text-slate-400">/ {formatRupiah(tier.threshold)}</span></h2></div><span className="badge badge-amber">Audit & approval Admin</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-cream"><div className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-gold transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-[10px] leading-5 text-slate-500">{progress >= 100 ? "Omzet telah melewati ambang. Admin akan memeriksa kelayakan pada audit mingguan; level tidak berubah otomatis." : `Kumpulkan ${formatRupiah(Math.max(tier.threshold - user.totalOmzet, 0))} omzet terverifikasi lagi. Kenaikan role tetap melalui persetujuan Admin Pusat.`}</p></section>}
      <section className="overflow-hidden rounded-2xl border border-navy/10 bg-white"><div className="flex items-center justify-between border-b border-navy/10 px-6 py-5"><div><h2 className="font-serif text-2xl">Pesanan terbaru</h2><p className="mt-1 text-[10px] text-slate-500">Status pembayaran dan pengiriman Anda</p></div><Link href="/dashboard/pesanan" className="text-[10px] font-bold text-emerald-800">Lihat semua →</Link></div>{recent.length ? <div className="divide-y divide-navy/10">{recent.map((order) => <Link href={`/dashboard/pesanan/${order.id}`} key={order.id} className="flex flex-col gap-3 px-6 py-4 transition hover:bg-cream/30 sm:flex-row sm:items-center"><div className="flex-1"><p className="text-xs font-bold">{order.invoice}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(order.createdAt)}</p></div><StatusBadge status={order.status} /><p className="font-serif text-lg font-bold sm:w-32 sm:text-right">{formatRupiah(order.total)}</p></Link>)}</div> : <div className="p-8 text-center"><p className="text-xs text-slate-500">Belum ada pesanan. Mulai dari produk pilihan di katalog.</p><Link href="/katalog" className="button-secondary mt-4">Jelajahi Produk</Link></div>}</section>
    </div>
  );
}
