import type { Metadata } from "next";
import { BadgeCheck, PackageCheck, ShieldCheck } from "lucide-react";
import { getActiveProducts } from "@/lib/mock-data";
import { CatalogBrowser } from "@/components/catalog-browser";

export const metadata: Metadata = { title: "Katalog Produk", description: "Produk halal dan UMKM pilihan dengan harga khusus mitra UMANUSA." };
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const catalog = getActiveProducts();
  return (
    <main>
      <section className="relative overflow-hidden bg-[#0d352c] py-16 text-white lg:py-20">
        <div className="islamic-pattern absolute inset-0 text-white opacity-[0.03]" />
        <div className="container-wide relative"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-gold">Katalog terpusat UMANUSA</p><div className="mt-4 grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-end"><h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Produk baik dari<br /><span className="italic text-gold-light">tangan Nusantara.</span></h1><p className="max-w-lg text-sm leading-7 text-white/60">Pilihan produk halal dan karya UMKM yang disuplai, dikontrol mutu, serta diperbarui stoknya langsung oleh Admin Pusat.</p></div><div className="mt-8 flex flex-wrap gap-5 text-[11px] text-white/65"><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-gold" />Kurasi pusat</span><span className="flex items-center gap-2"><PackageCheck size={15} className="text-gold" />Stok nyata</span><span className="flex items-center gap-2"><BadgeCheck size={15} className="text-gold" />Harga sesuai jenjang</span></div></div>
      </section>
      <section className="container-wide py-12 lg:py-16"><CatalogBrowser products={catalog} /></section>
    </main>
  );
}
