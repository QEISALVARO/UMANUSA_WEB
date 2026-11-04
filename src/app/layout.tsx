import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.umanusa.id"),
  title: { default: "UMANUSA — Umat Berdaya, Nusantara Sejahtera", template: "%s | UMANUSA" },
  description: "Ekosistem ekonomi umat untuk produk halal, pemberdayaan UMKM, dan kemitraan yang amanah di seluruh Nusantara.",
  keywords: ["UMANUSA", "koperasi", "produk halal", "UMKM", "reseller", "ekonomi umat"],
  openGraph: { title: "UMANUSA", description: "Umat Berdaya, Nusantara Sejahtera", locale: "id_ID", type: "website" },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const clientUser = user ? { name: user.name, role: user.role } : null;
  return (
    <html lang="id">
      <body className="bg-paper text-navy antialiased">
        <CartProvider role={user?.role ?? "consumer"} userName={user?.name}>
          <SiteHeader user={clientUser} />
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
