"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CatalogProduct } from "@/lib/catalog-types";
import { formatRupiah, getPrice, ROLE_LABELS, type Role } from "@/lib/commerce";

type CartItem = { product: CatalogProduct; quantity: number };
type CartContextValue = {
  items: CartItem[];
  role: Role;
  count: number;
  subtotal: number;
  savings: number;
  hydrated: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: CatalogProduct, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus berada di dalam CartProvider");
  return context;
}

export function CartProvider({ children, role, userName }: { children: ReactNode; role: Role; userName?: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("umanusa_cart_v1");
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      localStorage.removeItem("umanusa_cart_v1");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("umanusa_cart_v1", JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const addItem = useCallback((product: CatalogProduct, quantity = 1) => {
    if (product.stock < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => item.product.id === product.id
          ? { ...item, product, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item);
      }
      return [...current, { product, quantity: Math.min(quantity, product.stock) }];
    });
    setToast(`${product.name} masuk ke keranjang`);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => current.map((item) => item.product.id === id
      ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
      : item));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + getPrice(item.product, role) * item.quantity, 0);
    const retail = items.reduce((sum, item) => sum + item.product.consumerPrice * item.quantity, 0);
    return {
      items,
      role,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      savings: retail - subtotal,
      hydrated,
      isOpen,
      setIsOpen,
      addItem,
      updateQuantity,
      removeItem: (id) => setItems((current) => current.filter((item) => item.product.id !== id)),
      clearCart: () => setItems([]),
    };
  }, [items, role, hydrated, isOpen, addItem, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.button
              aria-label="Tutup keranjang"
              className="absolute inset-0 bg-[#071b18]/55 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbfaf5] shadow-2xl"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
            >
              <div className="flex items-center justify-between border-b border-emerald-950/10 px-6 py-5">
                <div>
                  <p className="eyebrow">Keranjang belanja</p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Pilihan Anda</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="icon-button" aria-label="Tutup"><X size={20} /></button>
              </div>
              <div className="border-b border-emerald-950/10 bg-emerald-950/[0.035] px-6 py-3 text-xs text-emerald-950/70">
                {userName ? <><strong>{ROLE_LABELS[role]}</strong> · Harga khusus untuk {userName}</> : "Harga Konsumen aktif. Masuk sebagai mitra untuk harga khusus."}
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {!items.length ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-950/5 text-emerald-800"><ShoppingBag /></span>
                      <h3 className="mt-4 font-serif text-xl text-navy">Keranjang masih kosong</h3>
                      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">Temukan produk halal dan karya UMKM pilihan untuk keluarga atau usaha Anda.</p>
                      <Link href="/katalog" onClick={() => setIsOpen(false)} className="button-secondary mt-5">Jelajahi katalog</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {items.map(({ product, quantity }) => (
                      <motion.div layout key={product.id} className="flex gap-4 border-b border-emerald-950/10 pb-5">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div><h3 className="text-sm font-semibold text-navy">{product.name}</h3><p className="mt-1 text-xs text-slate-500">{product.unit}</p></div>
                            <button onClick={() => value.removeItem(product.id)} className="text-slate-400 transition hover:text-red-600" aria-label={`Hapus ${product.name}`}><Trash2 size={16} /></button>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-emerald-950/10 bg-white">
                              <button className="grid h-7 w-7 place-items-center" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Kurangi"><Minus size={12} /></button>
                              <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                              <button className="grid h-7 w-7 place-items-center" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Tambah"><Plus size={12} /></button>
                            </div>
                            <p className="text-sm font-bold text-emerald-800">{formatRupiah(getPrice(product, role) * quantity)}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t border-emerald-950/10 bg-white p-6">
                  <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatRupiah(value.subtotal)}</span></div>
                  {value.savings > 0 && <div className="mt-2 flex justify-between text-sm font-medium text-emerald-700"><span>Keuntungan harga mitra</span><span>−{formatRupiah(value.savings)}</span></div>}
                  <div className="mt-3 flex items-end justify-between border-t border-dashed border-slate-200 pt-3"><span className="font-semibold text-navy">Total belanja</span><span className="font-serif text-2xl font-bold text-navy">{formatRupiah(value.subtotal)}</span></div>
                  <p className="mt-2 text-xs text-slate-500">Ongkir dihitung dari tabel wilayah saat checkout.</p>
                  <Link href="/checkout" onClick={() => setIsOpen(false)} className="button-primary mt-5 w-full">Lanjut checkout <ArrowRight size={17} /></Link>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-5 left-1/2 z-[110] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-sm text-white shadow-2xl">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600"><ShoppingBag size={15} /></span>
            <span className="flex-1">{toast}</span>
            <button onClick={() => { setToast(""); setIsOpen(true); }} className="font-semibold text-gold">Lihat</button>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}
