"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Clock3, Landmark, Loader2, LockKeyhole, MapPin, PackageCheck, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatRupiah, getPrice } from "@/lib/commerce";

type Zone = { id: string; name: string; description: string; fee: number; eta: string };
type Defaults = { name: string; phone: string; address: string; city: string; province: string; postalCode: string };
type Bank = { name: string; account: string; holder: string };

export function CheckoutForm({ zones, defaults, bank }: { zones: Zone[]; defaults: Defaults; bank: Bank }) {
  const router = useRouter();
  const { items, subtotal, savings, role, hydrated, clearCart } = useCart();
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const zone = zones.find((item) => item.id === zoneId) ?? zones[0];
  const total = subtotal + (zone?.fee ?? 0);
  const serializedItems = useMemo(() => items.map((item) => ({ id: item.product.id, quantity: item.quantity })), [items]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || pending) return;
    setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: serializedItems, zoneId,
          recipientName: form.get("recipientName"), phone: form.get("phone"), address: form.get("address"),
          city: form.get("city"), province: form.get("province"), postalCode: form.get("postalCode"), notes: form.get("notes"),
        }),
      });
      const data = await response.json() as { id?: string; error?: string };
      if (!response.ok || !data.id) throw new Error(data.error || "Checkout gagal.");
      clearCart();
      router.push(`/dashboard/pesanan/${data.id}?baru=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout gagal diproses.");
      setPending(false);
    }
  }

  if (!hydrated) return <div className="grid min-h-80 place-items-center"><Loader2 className="animate-spin text-emerald-800" /></div>;
  if (!items.length) return <div className="rounded-2xl border border-dashed border-navy/20 bg-white py-20 text-center"><ShoppingBag className="mx-auto text-slate-300" size={42} /><h1 className="mt-5 font-serif text-3xl">Keranjang Anda kosong</h1><p className="mt-3 text-sm text-slate-500">Pilih produk terlebih dahulu sebelum melanjutkan checkout.</p><Link href="/katalog" className="button-primary mt-6">Buka Katalog <ArrowRight size={15} /></Link></div>;

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1fr_390px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-950 text-gold"><MapPin size={17} /></span><div><p className="text-xs font-bold">Alamat pengiriman</p><p className="mt-1 text-[10px] text-slate-500">Pastikan data dapat dihubungi oleh ekspedisi</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="field-label">Nama penerima</span><input name="recipientName" defaultValue={defaults.name} className="field-input" required /></label><label><span className="field-label">Nomor WhatsApp</span><input name="phone" defaultValue={defaults.phone} className="field-input" type="tel" required /></label><label className="sm:col-span-2"><span className="field-label">Alamat lengkap</span><textarea name="address" defaultValue={defaults.address} className="field-textarea" placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan" required /></label><label><span className="field-label">Kota / Kabupaten</span><input name="city" defaultValue={defaults.city} className="field-input" required /></label><label><span className="field-label">Provinsi</span><input name="province" defaultValue={defaults.province} className="field-input" required /></label><label><span className="field-label">Kode pos</span><input name="postalCode" defaultValue={defaults.postalCode} className="field-input" inputMode="numeric" required /></label><label><span className="field-label">Catatan pesanan <span className="font-normal text-slate-400">(opsional)</span></span><input name="notes" className="field-input" placeholder="Warna, patokan alamat, dsb." maxLength={500} /></label></div></section>
        <section className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-950 text-gold"><PackageCheck size={17} /></span><div><p className="text-xs font-bold">Zona & ongkos kirim</p><p className="mt-1 text-[10px] text-slate-500">Tarif tabel wilayah, bukan API otomatis</p></div></div><div className="mt-6 space-y-3">{zones.map((item) => <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${zoneId === item.id ? "border-emerald-700 bg-emerald-950/[.035]" : "border-navy/10 hover:border-navy/25"}`}><input type="radio" name="zone" value={item.id} checked={zoneId === item.id} onChange={() => setZoneId(item.id)} className="mt-1 accent-emerald-700" /><span className="flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs">{item.name}</strong><strong className="text-xs text-emerald-800">{formatRupiah(item.fee)}</strong></span><span className="mt-1.5 block text-[10px] leading-5 text-slate-500">{item.description}</span><span className="mt-1 block text-[10px] font-semibold text-slate-500">Estimasi {item.eta}</span></span></label>)}</div><p className="mt-4 rounded-lg bg-cream/70 p-3 text-[10px] leading-5 text-slate-500">Untuk berat berlebih atau wilayah khusus, Admin dapat menyesuaikan ongkir sebelum pembayaran disertai catatan pada pesanan.</p></section>
      </div>
      <aside className="rounded-2xl border border-navy/10 bg-white p-6 lg:sticky lg:top-28"><p className="font-serif text-2xl font-semibold">Ringkasan pesanan</p><div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">{items.map(({ product, quantity }) => <div key={product.id} className="flex gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream"><Image src={product.image} alt="" fill className="object-cover" sizes="56px" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{product.name}</p><p className="mt-1 text-[10px] text-slate-500">{quantity} × {formatRupiah(getPrice(product, role))}</p></div><p className="text-xs font-semibold">{formatRupiah(getPrice(product, role) * quantity)}</p></div>)}</div><div className="mt-5 space-y-3 border-t border-navy/10 pt-5 text-xs"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>{savings > 0 && <div className="flex justify-between font-semibold text-emerald-700"><span>Hemat harga mitra</span><span>−{formatRupiah(savings)}</span></div>}<div className="flex justify-between text-slate-500"><span>Ongkir · {zone?.name}</span><span>{formatRupiah(zone?.fee ?? 0)}</span></div><div className="flex items-end justify-between border-t border-dashed border-navy/15 pt-4"><span className="font-bold">Total tagihan</span><motion.strong key={total} initial={{ opacity: .4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-2xl">{formatRupiah(total)}</motion.strong></div></div><div className="mt-5 rounded-xl bg-cream/70 p-4"><p className="flex items-center gap-2 text-[11px] font-bold"><Landmark size={15} className="text-emerald-700" />Transfer setelah checkout</p><p className="mt-2 text-[10px] leading-5 text-slate-500">{bank.name}<br />{bank.account} · a.n. {bank.holder}</p></div><AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="form-error mt-4">{error}</motion.p>}</AnimatePresence><button disabled={pending || !zone} className="button-primary mt-5 w-full" type="submit">{pending ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}{pending ? "Membuat tagihan…" : "Buat Tagihan & Pesanan"}</button><p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-slate-500"><Clock3 size={14} className="mt-0.5 shrink-0 text-gold" />Unggah bukti transfer maksimal 24 jam setelah checkout. Pesanan belum lunas sebelum diverifikasi Admin.</p></aside>
    </form>
  );
}
