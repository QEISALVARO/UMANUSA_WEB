import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { ArrowLeft, BadgeCheck, Check, MapPin, PackageCheck, Scale, ShieldCheck, Truck } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await ensureSeeded();
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return { title: product?.name ?? "Produk", description: product?.shortDescription };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSeeded();
  const [product] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.active, true))).limit(1);
  if (!product) notFound();
  const related = await db.select().from(products).where(and(eq(products.category, product.category), ne(products.id, product.id), eq(products.active, true))).limit(3);
  const fallback = related.length ? related : await db.select().from(products).where(and(ne(products.id, product.id), eq(products.active, true))).limit(3);
  return (
    <main>
      <div className="container-wide py-6"><Link href="/katalog" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-800"><ArrowLeft size={14} />Kembali ke katalog</Link></div>
      <section className="container-wide grid gap-10 pb-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div><div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-cream"><Image src={product.image} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /><span className="absolute left-5 top-5 rounded-full bg-paper/90 px-4 py-2 text-xs font-bold text-emerald-900 backdrop-blur">{product.category}</span></div><div className="mt-4 grid grid-cols-3 gap-3"><div className="rounded-xl bg-cream/70 p-4 text-center"><ShieldCheck className="mx-auto text-emerald-800" size={19} /><p className="mt-2 text-[10px] font-bold">Kurasi Pusat</p></div><div className="rounded-xl bg-cream/70 p-4 text-center"><PackageCheck className="mx-auto text-emerald-800" size={19} /><p className="mt-2 text-[10px] font-bold">Stok {product.stock}</p></div><div className="rounded-xl bg-cream/70 p-4 text-center"><Truck className="mx-auto text-emerald-800" size={19} /><p className="mt-2 text-[10px] font-bold">Kirim Nasional</p></div></div></div>
        <div className="lg:py-4"><div className="flex items-center gap-2 text-xs text-slate-500"><MapPin size={13} className="text-gold" />{product.origin}<span>·</span><span>{product.sold} terjual</span></div><h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{product.name}</h1><p className="mt-4 text-base leading-7 text-slate-500">{product.shortDescription}</p><div className="my-6 h-px bg-navy/10" /><ProductPurchase product={product} /><div className="mt-8"><h2 className="font-serif text-2xl">Tentang produk</h2><p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p><div className="mt-6 grid gap-3 text-xs sm:grid-cols-2"><p className="flex items-start gap-2"><Scale className="mt-0.5 shrink-0 text-gold" size={15} /><span><strong className="block text-navy">Kemasan</strong><span className="mt-1 block text-slate-500">{product.unit} · {product.weight} gram</span></span></p><p className="flex items-start gap-2"><BadgeCheck className="mt-0.5 shrink-0 text-gold" size={15} /><span><strong className="block text-navy">Jaminan mutu</strong><span className="mt-1 block text-slate-500">{product.halalCert}</span></span></p></div><p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-950/[.04] p-4 text-xs leading-5 text-emerald-950"><Check size={15} className="shrink-0 text-emerald-700" />Pesanan Anda turut membuka akses pasar yang lebih adil bagi produsen mitra.</p></div></div>
      </section>
      <section className="border-t border-navy/10 bg-cream/45 py-16"><div className="container-wide"><p className="eyebrow">Mungkin Anda juga suka</p><h2 className="mt-2 font-serif text-3xl">Pilihan dari ekosistem</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fallback.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
    </main>
  );
}
