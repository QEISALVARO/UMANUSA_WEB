import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { RegisterCartSummary, RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Gabung Mitra" };
export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <main>
      <section className="bg-[#0d352c] py-14 text-white"><div className="container-wide"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-gold">Formulir registrasi terpadu</p><h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">Mulai perjalanan berdaya Anda.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Buat akun Konsumen atau Reseller. Kenaikan ke Agen dan Distributor mengikuti audit omzet serta persetujuan manual Admin Pusat.</p></div></section>
      <section className="container-wide grid gap-8 py-12 lg:grid-cols-[1fr_340px] lg:py-16">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_16px_50px_rgba(21,44,66,.06)] sm:p-9"><RegisterForm /></div>
        <aside className="space-y-5"><RegisterCartSummary /><div className="rounded-2xl border border-navy/10 bg-cream/60 p-6"><p className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={17} className="text-emerald-700" />Setelah pendaftaran</p><ul className="mt-4 space-y-3 text-[11px] leading-5 text-slate-600">{["Harga sesuai role aktif otomatis", "Kode referal pribadi langsung tersedia", "Pesanan dan omzet tercatat di dashboard", "Pengajuan bonus dapat dilakukan dari saldo digital"].map((text) => <li key={text} className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-700" />{text}</li>)}</ul></div><p className="px-2 text-[10px] leading-5 text-slate-400">Dengan mendaftar, Anda memahami bahwa pembayaran dan pencairan komisi diproses semi-manual oleh Admin/Keuangan Pusat sesuai SOP UMANUSA.</p></aside>
      </section>
    </main>
  );
}
