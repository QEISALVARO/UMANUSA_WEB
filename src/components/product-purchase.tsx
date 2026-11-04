"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { CatalogProduct } from "@/lib/catalog-types";
import { formatRupiah, getPrice } from "@/lib/commerce";

export function ProductPurchase({ product }: { product: CatalogProduct }) {
  const { role, addItem, setIsOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const price = getPrice(product, role);
  const prices = [
    { name: "Konsumen", value: product.consumerPrice, key: "consumer" },
    { name: "Reseller", value: product.resellerPrice, key: "reseller" },
    { name: "Agen", value: product.agentPrice, key: "agent" },
    { name: "Distributor", value: product.distributorPrice, key: "distributor" },
  ];
  function add(open = false) {
    addItem(product, quantity);
    setAdded(true);
    if (open) setIsOpen(true);
    window.setTimeout(() => setAdded(false), 1600);
  }
  return (
    <div>
      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <div className="flex items-end justify-between"><div><p className="text-xs text-slate-500">Harga {role === "admin" ? "Konsumen" : role === "agent" ? "Agen" : role.charAt(0).toUpperCase() + role.slice(1)}</p><p className="mt-1 font-serif text-4xl font-bold text-navy">{formatRupiah(price)}</p></div>{role !== "consumer" && role !== "admin" && <span className="badge badge-green">Hemat {formatRupiah(product.consumerPrice - price)}</span>}</div>
        <div className="mt-6 flex gap-3"><div className="flex items-center rounded-full border border-navy/15"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-12 w-11 place-items-center" aria-label="Kurangi jumlah"><Minus size={16} /></button><span className="w-8 text-center text-sm font-bold">{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="grid h-12 w-11 place-items-center" aria-label="Tambah jumlah"><Plus size={16} /></button></div><button onClick={() => add(false)} disabled={!product.stock} className="button-primary flex-1">{added ? <Check size={17} /> : <ShoppingBag size={17} />}{added ? "Ditambahkan" : "Tambah keranjang"}</button></div>
        <button onClick={() => add(true)} disabled={!product.stock} className="button-secondary mt-3 w-full">Beli sekarang</button>
      </div>
      <div className="mt-5 rounded-2xl bg-cream/70 p-5"><p className="text-xs font-bold text-navy">Transparansi harga kemitraan</p><div className="mt-3 space-y-2">{prices.map((item) => <div key={item.key} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${role === item.key ? "bg-emerald-800 font-bold text-white" : "text-slate-600"}`}><span>{item.name}{role === item.key && " · harga Anda"}</span><span>{formatRupiah(item.value)}</span></div>)}</div><p className="mt-3 text-[10px] leading-5 text-slate-500">Harga mitra aktif otomatis setelah masuk. Upgrade Agen dan Distributor dilakukan Admin setelah audit omzet.</p></div>
    </div>
  );
}
