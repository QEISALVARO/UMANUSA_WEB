"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Check, Clipboard, Copy, FileUp, LayoutDashboard, Loader2, Network, Package, RefreshCw, ShieldCheck, Upload, UsersRound, WalletCards } from "lucide-react";
import { withdrawalAction } from "@/app/dashboard/actions";
import type { FormState } from "@/app/actions";
import { formatRupiah, MIN_WITHDRAWAL, ROLE_LABELS, type Role } from "@/lib/commerce";
import { cn } from "@/lib/utils";

export function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = role === "admin" ? [{ href: "/dashboard/admin", label: "Pusat Operasional", icon: ShieldCheck }] : [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/pesanan", label: "Pesanan Saya", icon: Package },
    ...(["agent", "distributor"].includes(role) ? [{ href: "/dashboard/jaringan", label: "Jaringan Saya", icon: Network }] : []),
    ...(["reseller", "agent", "distributor"].includes(role) ? [{ href: "/dashboard/bonus", label: "Bonus & Pencairan", icon: WalletCards }] : []),
  ];
  return <nav className="space-y-1">{links.map((link) => { const active = link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition", active ? "bg-emerald-950 text-white shadow-md" : "text-slate-500 hover:bg-emerald-950/5 hover:text-emerald-900")}><link.icon size={17} className={active ? "text-gold" : ""} />{link.label}</Link>; })}</nav>;
}

export function CopyReferral({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  }
  return <button onClick={copy} className="flex w-full items-center justify-between rounded-xl border border-dashed border-navy/20 bg-cream/50 px-4 py-3 text-left transition hover:border-emerald-700"><span><span className="block text-[9px] uppercase tracking-wider text-slate-400">Kode referal Anda</span><strong className="mt-1 block text-sm tracking-wider text-navy">{code}</strong></span>{copied ? <Check size={16} className="text-emerald-700" /> : <Copy size={15} className="text-slate-400" />}</button>;
}

export function ProofUpload({ orderId, hasProof }: { orderId: string; hasProof: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ error?: string; success?: string }>({});
  async function upload() {
    if (!file || pending) return;
    setPending(true); setMessage({});
    const body = new FormData(); body.append("proof", file);
    try {
      const response = await fetch(`/api/orders/${orderId}/proof`, { method: "POST", body });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unggah gagal.");
      setMessage({ success: "Bukti berhasil diunggah. Admin akan memeriksa maksimal 1×24 jam pada hari kerja." });
      setFile(null); if (input.current) input.current.value = "";
      router.refresh();
    } catch (error) { setMessage({ error: error instanceof Error ? error.message : "Unggah gagal." }); }
    finally { setPending(false); }
  }
  return <div className="rounded-2xl border border-navy/10 bg-white p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-950 text-gold"><FileUp size={18} /></span><div><h2 className="text-sm font-bold">Unggah bukti transfer</h2><p className="mt-1 text-[10px] text-slate-500">JPG, PNG, WEBP, atau PDF · maksimal 3 MB</p></div></div><label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-navy/20 bg-cream/35 px-4 py-7 text-center transition hover:border-emerald-700"><Upload className="text-emerald-700" size={23} /><span className="mt-3 text-xs font-bold">{file ? file.name : hasProof ? "Pilih file untuk mengganti bukti" : "Pilih bukti dari perangkat"}</span><span className="mt-1 text-[10px] text-slate-400">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Pastikan nominal dan tanggal terlihat jelas"}</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setMessage({}); }} /></label><AnimatePresence>{message.error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error mt-3">{message.error}</motion.p>}{message.success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-success mt-3">{message.success}</motion.p>}</AnimatePresence><button type="button" onClick={upload} disabled={!file || pending} className="button-primary mt-4 w-full">{pending ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}{pending ? "Mengunggah…" : "Kirim untuk Diverifikasi"}</button></div>;
}

function WithdrawButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button-primary w-full" disabled={disabled || pending}>{pending ? <Loader2 size={16} className="animate-spin" /> : <WalletCards size={16} />}{pending ? "Mengajukan…" : disabled ? "Saldo Belum Mencukupi" : "Ajukan Pencairan"}</button>;
}

export function WithdrawalForm({ available, defaults }: { available: number; defaults: { bankName: string; bankAccount: string; bankHolder: string } }) {
  const [state, action] = useActionState<FormState, FormData>(withdrawalAction, {});
  const eligible = available >= MIN_WITHDRAWAL;
  const shortfall = Math.max(MIN_WITHDRAWAL - available, 0);
  return (
    <form action={action} className="rounded-2xl border border-navy/10 bg-white p-6">
      <h2 className="font-serif text-2xl">Ajukan pencairan</h2>
      <p className="mt-2 text-[11px] leading-5 text-slate-500">Minimum {formatRupiah(MIN_WITHDRAWAL)} · Diproses manual setiap Jumat untuk pengajuan hingga Kamis 15.00.</p>
      <div className={`mt-4 rounded-xl p-3 text-[11px] leading-5 ${eligible ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
        <p><strong>Minimum pencairan {formatRupiah(MIN_WITHDRAWAL)}.</strong></p>
        {eligible ? (
          <p className="mt-1">Saldo tersedia {formatRupiah(available)}. Anda dapat mengajukan pencairan mulai dari {formatRupiah(MIN_WITHDRAWAL)}.</p>
        ) : (
          <p className="mt-1">Saldo tersedia {formatRupiah(Math.max(available, 0))} belum memenuhi minimum. Kurang {formatRupiah(shortfall)} lagi untuk dapat mengajukan pencairan.</p>
        )}
      </div>
      <div className="mt-5 space-y-4">
        <label><span className="field-label">Nominal pencairan</span><input className="field-input" name="amount" type="number" min={MIN_WITHDRAWAL} max={available} step={1000} placeholder={`Contoh: ${MIN_WITHDRAWAL}`} disabled={!eligible} required /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="field-label">Nama bank</span><input className="field-input" name="bankName" defaultValue={defaults.bankName} placeholder="BSI / BCA / Mandiri" disabled={!eligible} required /></label>
          <label><span className="field-label">Nomor rekening</span><input className="field-input" name="bankAccount" defaultValue={defaults.bankAccount} inputMode="numeric" disabled={!eligible} required /></label>
        </div>
        <label><span className="field-label">Nama pemilik rekening</span><input className="field-input" name="bankHolder" defaultValue={defaults.bankHolder} disabled={!eligible} required /></label>
        {state.error && <p className="form-error">{state.error}</p>}
        {state.success && <p className="form-success">{state.success}</p>}
        <WithdrawButton disabled={!eligible} />
      </div>
    </form>
  );
}
