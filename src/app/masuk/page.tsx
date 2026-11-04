import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth-forms";
import { BrandMark } from "@/components/brand-logo";

export const metadata: Metadata = { title: "Masuk Dashboard" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(next?.startsWith("/") ? next : user.role === "admin" ? "/dashboard/admin" : "/dashboard");
  return (
    <main className="relative min-h-[calc(100vh-108px)] overflow-hidden bg-cream/60 py-12 lg:py-20">
      <div className="islamic-pattern absolute inset-0 text-emerald-900 opacity-[0.025]" />
      <div className="container-wide relative grid overflow-hidden rounded-[1.75rem] border border-navy/10 bg-white shadow-[0_25px_80px_rgba(21,44,66,.09)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#0d352c] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="islamic-pattern absolute inset-0 text-white opacity-[0.04]" /><BrandMark className="absolute -bottom-20 -right-16 h-96 w-96 text-white/[.035]" /><div className="relative"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-gold">Ruang kerja UMANUSA</p><h1 className="mt-5 font-serif text-5xl leading-[1.08]">Satu pintu untuk<br /><span className="italic text-gold-light">bertumbuh bersama.</span></h1><p className="mt-5 max-w-sm text-sm leading-7 text-white/55">Pantau pesanan, omzet, jaringan, dan saldo bonus Anda dalam dashboard pribadi yang aman.</p></div><div className="relative mt-16 space-y-4 text-xs text-white/65"><p className="flex items-center gap-3"><ShieldCheck className="text-gold" size={17} />Sesi login terenkripsi & HTTP-only</p><p className="flex items-center gap-3"><BadgeCheck className="text-gold" size={17} />Hak akses sesuai jenjang mitra</p><p className="flex items-center gap-3"><LockKeyhole className="text-gold" size={17} />Data transaksi tercatat terpusat</p></div></div>
        <div className="p-6 sm:p-10 lg:p-12"><div className="mx-auto max-w-md"><p className="eyebrow">Selamat datang kembali</p><h2 className="mt-2 font-serif text-3xl font-semibold">Masuk ke akun Anda</h2><p className="mb-7 mt-2 text-xs leading-5 text-slate-500">Belum menjadi bagian UMANUSA? <Link href="/gabung" className="font-bold text-emerald-800">Daftar sekarang</Link></p><LoginForm next={next} /></div></div>
      </div>
    </main>
  );
}
