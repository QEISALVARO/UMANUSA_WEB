"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getPrice } from "@/lib/commerce";
import { useCart } from "@/components/cart-provider";

export function CatalogBrowser({ products }: { products: CatalogProduct[] }) {
  const { role } = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("featured");
  const categories = ["Semua", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return products.filter((product) => (category === "Semua" || product.category === category) && (!normalized || `${product.name} ${product.shortDescription} ${product.origin}`.toLowerCase().includes(normalized)))
      .sort((a, b) => {
        if (sort === "low") return getPrice(a, role) - getPrice(b, role);
        if (sort === "high") return getPrice(b, role) - getPrice(a, role);
        if (sort === "sold") return b.sold - a.sold;
        return Number(b.featured) - Number(a.featured) || b.sold - a.sold;
      });
  }, [products, query, category, sort, role]);

  return (
    <div>
      <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-[0_12px_40px_rgba(21,44,66,.05)]">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1"><span className="sr-only">Cari produk</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field-input !py-3 !pl-11" placeholder="Cari madu, kopi, asal produk…" />{query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={16} /></button>}</label>
          <label className="relative md:w-56"><SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><span className="sr-only">Urutkan produk</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="field-select !py-3 !pl-11"><option value="featured">Produk unggulan</option><option value="sold">Paling banyak terjual</option><option value="low">Harga terendah</option><option value="high">Harga tertinggi</option></select></label>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-emerald-800 text-white" : "bg-cream/70 text-slate-600 hover:bg-emerald-950/5"}`}>{item}</button>)}
        </div>
      </div>
      <div className="mb-5 mt-7 flex items-center justify-between text-xs text-slate-500"><p>Menampilkan <strong className="text-navy">{filtered.length}</strong> dari {products.length} produk</p><p>Kurasi & stok oleh Admin Pusat</p></div>
      {filtered.length ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => <motion.div layout key={product.id} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .25 }}><ProductCard product={product} /></motion.div>)}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy/20 py-20 text-center"><Search className="mx-auto text-slate-300" size={40} /><h2 className="mt-4 font-serif text-2xl">Produk belum ditemukan</h2><p className="mt-2 text-sm text-slate-500">Coba kata kunci atau kategori yang berbeda.</p><button className="button-secondary mt-5" onClick={() => { setQuery(""); setCategory("Semua"); }}>Atur ulang pencarian</button></div>
      )}
    </div>
  );
}
