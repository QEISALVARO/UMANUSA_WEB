import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpenCheck, Building2, Check, Coins, GraduationCap, HandHeart, Landmark, Leaf, Network, PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Store, Truck, Upload, UsersRound, WalletCards } from "lucide-react";
import { desc, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { bonusLedger, orders, products, users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { TierJourney } from "@/components/tier-journey";
import { formatCompactRupiah } from "@/lib/commerce";

export const dynamic = "force-dynamic";

const values = [
  { title: "Amanah", text: "Setiap transaksi dan kepercayaan dikelola dengan tanggung jawab.", icon: ShieldCheck },
  { title: "Syariah", text: "Menjunjung akad yang jelas, transparan, dan saling memberi manfaat.", icon: BookOpenCheck },
  { title: "Profesional", text: "Proses kerja terukur, pencatatan rapi, dan layanan yang bertumbuh.", icon: BadgeCheck },
  { title: "Kolaboratif", text: "Bertumbuh melalui gotong royong, bukan persaingan yang melemahkan.", icon: UsersRound },
  { title: "Berdampak", text: "Keberhasilan diukur dari manfaat nyata bagi umat dan UMKM.", icon: HandHeart },
];
const businessUnits = [
  { name: "UMANUSA Mart", text: "Distribusi produk halal & kebutuhan umat.", icon: Store },
  { name: "UMANUSA Digital", text: "Teknologi katalog, jaringan, dan saldo mitra.", icon: WalletCards },
  { name: "UMANUSA Logistik", text: "Pengemasan dan pengiriman terkoordinasi pusat.", icon: Truck },
  { name: "UMANUSA Academy", text: "Pendampingan literasi jualan dan kepemimpinan.", icon: GraduationCap },
  { name: "UMANUSA Care", text: "Program berbagi dan pemberdayaan sosial.", icon: HandHeart },
];
const roadmap = [
  { year: "Tahun 01", title: "Fondasi Digital", text: "Portal mitra, katalog terpusat, pembayaran terverifikasi, dan pembukuan bonus digital." },
  { year: "Tahun 02", title: "Penguatan UMKM", text: "Kurasi produk lintas daerah, standardisasi mutu, serta kelas penjualan bagi mitra awal." },
  { year: "Tahun 03", title: "Ekspansi Jaringan", text: "Penguatan Agen dan Distributor wilayah dengan pendampingan operasional yang terukur." },
  { year: "Tahun 04", title: "Kemandirian Ekosistem", text: "Integrasi layanan logistik dan pengembangan produk unggulan berbasis kebutuhan jaringan." },
  { year: "Tahun 05", title: "Dampak Berkelanjutan", text: "Ekosistem umat yang mandiri, inklusif, dan membuka lebih banyak kesempatan ekonomi." },
];

export default async function HomePage() {
  await ensureSeeded();
  const featured = await db.select().from(products).where(sql`${products.active} = true`).orderBy(desc(products.featured), desc(products.sold)).limit(4);
  const [partnerMetric] = await db.select({ value: sql<number>`count(*)::int` }).from(users).where(ne(users.role, "admin"));
  const [omzetMetric] = await db.select({ value: sql<number>`coalesce(sum(${orders.subtotal}), 0)::int` }).from(orders).where(inArray(orders.status, ["paid", "processing", "shipped", "completed"]));
  const [bonusMetric] = await db.select({ value: sql<number>`coalesce(sum(${bonusLedger.amount}), 0)::int` }).from(bonusLedger);
  const [productMetric] = await db.select({ value: sql<number>`count(*)::int` }).from(products).where(sql`${products.active} = true`);

  return (
    <main>
      <HomeHero metrics={{ partners: partnerMetric.value, products: productMetric.value, omzet: omzetMetric.value, bonus: bonusMetric.value }} />

      <section className="border-b border-navy/10 bg-cream/65 py-5">
        <div className="container-wide flex items-center justify-between gap-7 overflow-x-auto">
          <p className="shrink-0 text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">Nilai yang menggerakkan kami</p>
          {values.map((value, index) => <div key={value.title} className="flex shrink-0 items-center gap-2 text-[11px] font-bold text-emerald-950"><value.icon size={14} className="text-gold" />{value.title}{index < values.length - 1 && <span className="ml-4 text-navy/15">◆</span>}</div>)}
        </div>
      </section>

      <section id="ekosistem" className="section-space relative overflow-hidden bg-paper">
        <div className="dot-grid absolute right-0 top-0 h-72 w-72 opacity-40 [mask-image:linear-gradient(to_bottom_left,black,transparent)]" />
        <div className="container-wide relative grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
          <Reveal direction="left">
            <div className="relative mx-auto max-w-md">
              <div className="aspect-[4/4.5] overflow-hidden rounded-[10rem_10rem_1.5rem_1.5rem] bg-emerald-950 p-1.5">
                <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[9.6rem_9.6rem_1.1rem_1.1rem] border border-gold/30 bg-[radial-gradient(circle_at_50%_30%,#17654f,#0a342b_70%)] px-10 text-center text-white">
                  <div className="islamic-pattern absolute inset-0 text-white opacity-[0.05]" />
                  <Leaf className="relative text-gold" size={42} strokeWidth={1.3} />
                  <p className="relative mt-7 font-serif text-4xl leading-tight">Dari Umat,<br />oleh Umat,<br /><span className="italic text-gold-light">untuk Nusantara.</span></p>
                  <div className="relative mt-7 h-px w-20 bg-gold/50" />
                  <p className="relative mt-6 text-xs leading-6 text-white/55">Satu napas untuk kemandirian ekonomi, teknologi, dan kemitraan yang saling menguatkan.</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-5 rounded-2xl border border-navy/10 bg-white p-4 shadow-xl sm:-right-10"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cream text-emerald-800"><Landmark size={21} /></span><div><p className="text-xs font-bold">Koperasi + Korporasi</p><p className="mt-1 text-[10px] text-slate-500">Tata kelola yang saling melengkapi</p></div></div></div>
            </div>
          </Reveal>
          <div>
            <Reveal><p className="eyebrow">Ekosistem, bukan sekadar marketplace</p><h2 className="section-title text-navy">Menghubungkan potensi.<br /><span className="italic text-emerald-800">Menggerakkan ekonomi.</span></h2><p className="body-copy mt-6 max-w-xl">UMANUSA mempertemukan produsen UMKM, produk halal pilihan, dan jejaring mitra dalam tata kelola yang jelas. Koperasi menjaga kedekatan dengan anggota, sementara PT UMANUSA Digital membangun teknologi yang membuat kolaborasi menjadi lebih mudah.</p></Reveal>
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
              <StaggerItem><div className="h-full rounded-2xl border border-navy/10 bg-white p-5"><Building2 className="text-gold" size={24} /><h3 className="mt-4 font-serif text-xl font-semibold">Koperasi UMANUSA</h3><p className="mt-2 text-xs leading-6 text-slate-500">Wadah keanggotaan, pemberdayaan mitra, serta penguatan usaha berbasis nilai kebersamaan.</p></div></StaggerItem>
              <StaggerItem><div className="h-full rounded-2xl border border-navy/10 bg-white p-5"><Sparkles className="text-gold" size={24} /><h3 className="mt-4 font-serif text-xl font-semibold">PT UMANUSA Digital</h3><p className="mt-2 text-xs leading-6 text-slate-500">Pengelola teknologi, kurasi pengalaman pengguna, dan pengembangan layanan digital ekosistem.</p></div></StaggerItem>
            </Stagger>
            <Reveal delay={.15}><Link href="/tentang" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 transition hover:gap-3">Kenali profil & legalitas <ArrowRight size={15} /></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="bg-cream/60 py-16">
        <div className="container-wide">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">Lima unit saling menguatkan</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">Satu ekosistem, banyak jalan berdaya.</h2></div><p className="max-w-md text-xs leading-6 text-slate-500">Infrastruktur bersama agar setiap mitra dapat memulai dari kemampuannya dan bertumbuh dengan dukungan yang tepat.</p></Reveal>
          <Stagger className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{businessUnits.map((unit, index) => <StaggerItem key={unit.name}><div className="group h-full rounded-2xl border border-navy/10 bg-paper p-5 transition hover:border-emerald-700/30 hover:bg-white"><div className="flex items-center justify-between"><unit.icon className="text-emerald-800" size={22} /><span className="font-serif text-2xl text-navy/15">0{index + 1}</span></div><h3 className="mt-5 text-sm font-bold">{unit.name}</h3><p className="mt-2 text-[11px] leading-5 text-slate-500">{unit.text}</p></div></StaggerItem>)}</Stagger>
        </div>
      </section>

      <section className="section-space bg-paper">
        <div className="container-wide">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">Kurasi produk umat & UMKM</p><h2 className="section-title">Pilihan baik,<br /><span className="italic text-emerald-800">dampak yang nyata.</span></h2></div><div><p className="mb-5 max-w-sm text-sm leading-6 text-slate-500">Produk dan stok dikelola Admin Pusat. Masuk sebagai mitra untuk melihat harga sesuai jenjang Anda.</p><Link href="/katalog" className="button-secondary">Lihat Semua Produk <ArrowRight size={15} /></Link></div></Reveal>
          <Stagger className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <StaggerItem key={product.id}><ProductCard product={product} /></StaggerItem>)}</Stagger>
        </div>
      </section>

      <TierJourney />

      <section className="section-space bg-paper">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center"><p className="eyebrow">Alur yang jelas & tercatat</p><h2 className="section-title">Dari pesanan menjadi<br /><span className="italic text-emerald-800">keberkahan bersama.</span></h2><p className="body-copy mt-5">Setiap tahap memiliki status yang dapat dilacak. Tidak ada status lunas otomatis sebelum Admin memeriksa bukti transfer.</p></Reveal>
          <Stagger className="relative mt-14 grid gap-5 md:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-8 hidden border-t border-dashed border-emerald-800/25 md:block" />
            {[
              { icon: ShoppingBag, title: "Pilih & checkout", text: "Harga menyesuaikan level login. Pilih zona kirim dari tabel tarif pusat." },
              { icon: Upload, title: "Transfer & unggah", text: "Transfer ke rekening pusat lalu unggah bukti melalui detail pesanan." },
              { icon: BadgeCheck, title: "Verifikasi Admin", text: "Admin memeriksa dana dan bukti maksimal dalam SLA operasional 1×24 jam." },
              { icon: Coins, title: "Omzet & bonus", text: "Pesanan lunas mencatat omzet dan komisi selisih harga ke saldo pengajak." },
            ].map((step, index) => <StaggerItem key={step.title}><div className="relative h-full rounded-2xl border border-navy/10 bg-white p-6 text-center"><span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-950 text-gold shadow-lg"><step.icon size={25} /><span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gold text-[10px] font-black text-navy">{index + 1}</span></span><h3 className="mt-5 font-serif text-xl font-semibold">{step.title}</h3><p className="mt-3 text-xs leading-6 text-slate-500">{step.text}</p></div></StaggerItem>)}
          </Stagger>
          <Reveal className="mt-10 rounded-2xl bg-cream p-5 text-center text-xs leading-6 text-slate-600"><strong className="text-navy">Kebijakan pencairan:</strong> pengajuan masuk kapan saja melalui dashboard, direkap Keuangan Pusat, dan ditransfer manual setiap Jumat. Minimum pencairan Rp50.000.</Reveal>
        </div>
      </section>

      <section id="roadmap" className="section-space overflow-hidden bg-[#f1eee0]">
        <div className="container-wide">
          <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end"><div><p className="eyebrow">Roadmap bisnis 5 tahun</p><h2 className="section-title">Tumbuh bertahap.<br />Berdampak berkelanjutan.</h2></div><p className="body-copy max-w-lg lg:justify-self-end">Fondasi digital hari ini disiapkan untuk membuka lebih banyak akses pasar, kapasitas mitra, dan kemandirian ekonomi umat di masa depan.</p></Reveal>
          <Stagger className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 md:grid-cols-5">{roadmap.map((item, index) => <StaggerItem key={item.year}><div className="group h-full min-h-64 bg-paper p-5 transition hover:bg-emerald-950 hover:text-white"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 group-hover:text-gold">{item.year}</span><span className="font-serif text-3xl text-navy/10 group-hover:text-white/10">0{index + 1}</span></div><h3 className="mt-10 font-serif text-xl font-semibold">{item.title}</h3><p className="mt-3 text-[11px] leading-6 text-slate-500 group-hover:text-white/55">{item.text}</p></div></StaggerItem>)}</Stagger>
        </div>
      </section>

      <section className="bg-paper py-20">
        <div className="container-wide">
          <Reveal><div className="relative overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-14 text-center text-white sm:px-12 lg:py-20"><div className="islamic-pattern absolute inset-0 text-white opacity-[0.035]" /><div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-gold/20" /><div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full border border-gold/20" /><div className="relative mx-auto max-w-2xl"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold"><Network size={22} /></span><p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-gold">Langkah awal Anda bermakna</p><h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Bukan hanya berjualan.<br /><span className="italic text-gold-light">Mari saling menguatkan.</span></h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/60">Daftar sebagai Konsumen atau Reseller hari ini. Kembangkan omzet, bangun jaringan, dan tumbuh melalui jenjang kemitraan UMANUSA.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/gabung" className="button-gold">Gabung Sekarang <ArrowRight size={16} /></Link><Link href="/kemitraan" className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/20 px-6 text-xs font-bold transition hover:border-gold">Bandingkan Jenjang</Link></div><p className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/45"><Check size={12} className="text-gold" />Tanpa subdomain · Semua aktivitas aman di umanusa.id</p></div></div></Reveal>
        </div>
      </section>
    </main>
  );
}
