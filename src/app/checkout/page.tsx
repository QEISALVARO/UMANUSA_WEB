import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBankSettings, getActiveShippingZones } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk?next=/checkout");
  const zones = getActiveShippingZones();
  const setting = getBankSettings();
  return (
    <main className="bg-cream/35 py-10 lg:py-14"><div className="container-wide"><div className="mb-8"><p className="eyebrow">Checkout aman & tercatat</p><h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Selesaikan pesanan Anda.</h1><p className="mt-3 text-sm text-slate-500">Harga telah disesuaikan dengan jenjang akun <strong className="text-navy">{user.name}</strong>.</p></div><CheckoutForm zones={zones} defaults={{ name: user.name, phone: user.phone, address: user.address, city: user.city, province: user.province, postalCode: user.postalCode }} bank={{ name: setting.bank_name ?? "Bank Syariah Indonesia", account: setting.bank_account ?? "Hubungi Admin", holder: setting.bank_holder ?? "Koperasi UMANUSA" }} /></div></main>
  );
}
