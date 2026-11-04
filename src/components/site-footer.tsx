import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0d2924] text-white">
      <div className="islamic-pattern absolute inset-0 opacity-[0.04]" />
      <div className="container-wide relative py-16 lg:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.5fr_.8fr_.8fr_1.1fr]">
          <div>
            <BrandLogo light />
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/60">Menghubungkan umat, menggerakkan ekonomi, dan memberdayakan mitra melalui koperasi dan teknologi yang amanah.</p>
            <p className="mt-5 font-serif text-lg italic text-gold">Dari Umat, oleh Umat, untuk Nusantara.</p>
          </div>
          <div>
            <h3 className="footer-heading">Ekosistem</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <Link className="footer-link" href="/katalog">Katalog Produk</Link>
              <Link className="footer-link" href="/kemitraan">Jenjang Kemitraan</Link>
              <Link className="footer-link" href="/gabung">Registrasi Mitra</Link>
              <Link className="footer-link" href="/dashboard">Ruang Kerja Mitra</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-heading">UMANUSA</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <Link className="footer-link" href="/tentang">Profil & Filosofi</Link>
              <Link className="footer-link" href="/tentang#legalitas">Legalitas</Link>
              <Link className="footer-link" href="/tentang#roadmap">Roadmap</Link>
              <Link className="footer-link" href="/kemitraan#faq">Pusat Bantuan</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-heading">Sekretariat Pusat</h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/60">
              <p className="flex gap-3"><MapPin className="mt-1 shrink-0 text-gold" size={16} />Bandung, Jawa Barat<br />Indonesia</p>
              <a href="mailto:salam@umanusa.id" className="flex items-center gap-3 transition hover:text-white"><Mail className="shrink-0 text-gold" size={16} />salam@umanusa.id</a>
              <p className="flex items-center gap-3"><Phone className="shrink-0 text-gold" size={16} />Layanan mitra · Senin–Jumat</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 pt-7 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Koperasi UMANUSA & PT UMANUSA Digital.</p>
          <div className="flex items-center gap-5"><span>Syariah</span><span>Amanah</span><span>Berkolaborasi</span><Link href="/gabung" className="inline-flex items-center gap-1 text-gold">Mulai berdaya <ArrowUpRight size={13} /></Link></div>
        </div>
      </div>
      <BrandMark className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 text-white/[0.025]" />
    </footer>
  );
}
