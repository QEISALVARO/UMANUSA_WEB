"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Phone, ShoppingBag, UserRound, UsersRound } from "lucide-react";
import { loginAction, registerAction, type FormState } from "@/app/actions";
import { useCart } from "@/components/cart-provider";
import { formatRupiah } from "@/lib/commerce";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="button-primary w-full" type="submit">{pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <ArrowRight size={16} />}{pending ? "Memproses…" : children}</button>;
}

const demoAccounts = [
  { label: "Admin", email: "admin@umanusa.id" },
  { label: "Distributor", email: "distributor@umanusa.id" },
  { label: "Agen", email: "agen@umanusa.id" },
  { label: "Reseller", email: "reseller@umanusa.id" },
  { label: "Konsumen", email: "konsumen@umanusa.id" },
];

export function LoginForm({ next = "" }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <AnimatePresence>{state.error && <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-error">{state.error}</motion.p>}</AnimatePresence>
        <label><span className="field-label">Email</span><span className="relative block"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="field-input !pl-10" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required /></span></label>
        <label><span className="field-label">Kata sandi</span><span className="relative block"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="field-input !pl-10 !pr-11" type={visible ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" autoComplete="current-password" required /><button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Tampilkan kata sandi">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <div className="flex items-center justify-between text-[11px]"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" defaultChecked className="accent-emerald-700" />Ingat perangkat ini</label><a href="mailto:salam@umanusa.id?subject=Bantuan%20akun%20UMANUSA" className="font-semibold text-emerald-800">Butuh bantuan?</a></div>
        <Submit>Masuk ke Dashboard</Submit>
      </form>
      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-navy/10" />atau coba akun demo<span className="h-px flex-1 bg-navy/10" /></div>
      <div className="flex flex-wrap gap-2">{demoAccounts.map((account) => <button key={account.email} type="button" onClick={() => { setEmail(account.email); setPassword("Umanusa2026!"); }} className={`rounded-full border px-3 py-2 text-[10px] font-bold transition ${email === account.email ? "border-emerald-700 bg-emerald-800 text-white" : "border-navy/10 bg-cream/60 text-slate-600 hover:border-emerald-700"}`}>{account.label}</button>)}</div>
      <p className="mt-3 rounded-lg bg-cream/70 p-3 text-center text-[10px] leading-5 text-slate-500">Kata sandi seluruh akun demo: <strong className="select-all text-navy">Umanusa2026!</strong><br />Pilih role di atas untuk mengisi akun secara otomatis.</p>
    </div>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});
  const [role, setRole] = useState("reseller");
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <AnimatePresence>{state.error && <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="form-error">{state.error}</motion.p>}</AnimatePresence>
      <div><span className="field-label">Daftar sebagai</span><div className="grid grid-cols-2 gap-3">{[{ id: "consumer", title: "Konsumen", text: "Belanja & lacak pesanan", icon: ShoppingBag }, { id: "reseller", title: "Reseller", text: "Harga mitra & saldo bonus", icon: UsersRound }].map((item) => <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`relative rounded-xl border p-4 text-left transition ${role === item.id ? "border-emerald-700 bg-emerald-950/[.04]" : "border-navy/10 bg-white"}`}><item.icon size={19} className={role === item.id ? "text-emerald-700" : "text-slate-400"} /><span className="mt-3 block text-xs font-bold">{item.title}</span><span className="mt-1 block text-[10px] text-slate-500">{item.text}</span>{role === item.id && <Check className="absolute right-3 top-3 text-emerald-700" size={15} />}</button>)}</div></div>
      <label><span className="field-label">Nama lengkap</span><span className="relative block"><UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="field-input !pl-10" name="name" placeholder="Nama sesuai identitas" autoComplete="name" required /></span></label>
      <div className="grid gap-4 sm:grid-cols-2"><label><span className="field-label">Email</span><input className="field-input" type="email" name="email" placeholder="nama@email.com" autoComplete="email" required /></label><label><span className="field-label">Nomor WhatsApp</span><input className="field-input" type="tel" name="phone" placeholder="08xxxxxxxxxx" autoComplete="tel" required /></label></div>
      <label><span className="field-label">Kata sandi</span><input className="field-input" type="password" name="password" placeholder="Minimal 8 karakter" autoComplete="new-password" minLength={8} required /></label>
      <label><span className="field-label">Kode referal mitra <span className="font-normal text-slate-400">(opsional)</span></span><input className="field-input uppercase" name="referral" placeholder="Contoh: MARYAM26" /></label>
      <label className="flex items-start gap-3 rounded-xl bg-cream/60 p-3 text-[10px] leading-5 text-slate-500"><input type="checkbox" name="terms" value="yes" className="mt-1 accent-emerald-700" required /><span>Saya menyetujui ketentuan layanan, verifikasi pembayaran manual, dan SOP kenaikan level oleh Admin Pusat. Data digunakan untuk operasional akun dan pesanan.</span></label>
      <Submit>Buat Akun & Masuk Dashboard</Submit>
      <p className="text-center text-[11px] text-slate-500">Sudah punya akun? <Link href="/masuk" className="font-bold text-emerald-800">Masuk di sini</Link></p>
    </form>
  );
}

export function RegisterCartSummary() {
  const { items, count, subtotal, setIsOpen } = useCart();
  return <div className="rounded-2xl bg-[#0d352c] p-6 text-white"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold"><ShoppingBag size={18} /></span><div><p className="text-xs font-bold">Belanja setelah mendaftar</p><p className="mt-1 text-[10px] text-white/50">Keranjang Anda tetap tersimpan</p></div></div>{items.length ? <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs text-white/65">{count} produk siap di-checkout</p><p className="mt-2 font-serif text-3xl text-gold-light">{formatRupiah(subtotal)}</p><p className="mt-2 text-[10px] leading-5 text-white/45">Setelah akun dibuat, buka keranjang untuk melengkapi alamat dan zona pengiriman.</p><button type="button" onClick={() => setIsOpen(true)} className="mt-4 text-xs font-bold text-gold">Lihat keranjang →</button></div> : <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs leading-6 text-white/55">Belum ada produk di keranjang. Anda dapat mendaftar lebih dulu atau memilih produk untuk belanja pertama.</p><Link href="/katalog" className="mt-4 inline-block text-xs font-bold text-gold">Pilih produk →</Link></div>}</div>;
}
