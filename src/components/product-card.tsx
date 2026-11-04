"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MapPin, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { CatalogProduct } from "@/lib/catalog-types";
import { formatRupiah, getPrice } from "@/lib/commerce";

export function ProductCard({ product, priority = false }: { product: CatalogProduct; priority?: boolean }) {
  const { role, addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = getPrice(product, role);
  const isPartner = role !== "consumer" && role !== "admin";

  function handleAdd() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-navy/10 bg-white transition duration-500 hover:-translate-y-1.5 hover:border-emerald-800/25 hover:shadow-[0_22px_55px_rgba(15,81,50,.12)]">
      <Link href={`/produk/${product.slug}`} className="relative block aspect-[1/1.02] overflow-hidden bg-cream">
        <Image src={product.image} alt={product.name} fill priority={priority} className="object-cover transition duration-700 ease-out group-hover:scale-[1.055]" sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/25 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-[10px] font-bold text-emerald-900 backdrop-blur-md">{product.category}</span>
        {product.stock < 15 && product.stock > 0 && <span className="absolute right-4 top-4 rounded-full bg-[#fff4d6] px-3 py-1.5 text-[10px] font-bold text-[#99640a]">Stok terbatas</span>}
        <span className="absolute bottom-4 right-4 grid h-9 w-9 translate-y-3 place-items-center rounded-full bg-white text-navy opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={16} /></span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><MapPin size={11} className="text-gold" />{product.origin}<span className="mx-1 text-slate-300">·</span>{product.unit}</div>
        <Link href={`/produk/${product.slug}`} className="mt-2.5 font-serif text-[1.25rem] font-semibold leading-tight text-navy transition hover:text-emerald-800">{product.name}</Link>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{product.shortDescription}</p>
        <div className="mt-auto pt-5">
          {isPartner && <div className="mb-1 flex items-center justify-between text-[10px]"><span className="text-slate-400 line-through">{formatRupiah(product.consumerPrice)}</span><span className="font-bold text-emerald-700">Hemat {formatRupiah(product.consumerPrice - price)}</span></div>}
          <div className="flex items-center justify-between gap-3">
            <div><p className="font-serif text-[1.25rem] font-bold tracking-tight text-navy">{formatRupiah(price)}</p>{isPartner && <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">Harga {role === "reseller" ? "Reseller" : role === "agent" ? "Agen" : "Distributor"}</p>}</div>
            <button disabled={!product.stock} onClick={handleAdd} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all ${added ? "bg-emerald-700 text-white" : "bg-navy text-white hover:scale-105 hover:bg-emerald-700"} disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400`} aria-label={`Tambah ${product.name} ke keranjang`}>
              {added ? <Check size={18} /> : product.stock ? <Plus size={19} /> : <ShoppingBag size={17} />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
