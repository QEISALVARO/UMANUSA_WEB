import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/mock-data";
import { formatDate, formatRupiah } from "@/lib/commerce";
import { EmptyState, StatusBadge } from "@/components/order-ui";

export const dynamic = "force-dynamic";
export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role === "admin") redirect("/dashboard/admin?tab=orders");
  const list = getOrdersByUser(user.id);
  return <div className="space-y-6"><div><p className="eyebrow">Transaksi Anda</p><h1 className="mt-2 font-serif text-4xl">Pesanan Saya</h1><p className="mt-2 text-xs leading-6 text-slate-500">Lacak tagihan, unggah bukti transfer, dan lihat perkembangan pengiriman.</p></div>{list.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Invoice</th><th>Tanggal</th><th>Status</th><th>Total</th><th></th></tr></thead><tbody>{list.map((order) => <tr key={order.id}><td><p className="font-bold text-navy">{order.invoice}</p><p className="mt-1 text-[10px] text-slate-400">{order.shippingZone}</p></td><td className="whitespace-nowrap text-slate-500">{formatDate(order.createdAt)}</td><td><StatusBadge status={order.status} /></td><td className="whitespace-nowrap font-bold">{formatRupiah(order.total)}</td><td><Link href={`/dashboard/pesanan/${order.id}`} className="inline-flex items-center gap-1 font-bold text-emerald-800">Detail <ArrowRight size={13} /></Link></td></tr>)}</tbody></table></div> : <EmptyState title="Belum ada pesanan" text="Produk pilihan dari katalog akan muncul di sini setelah checkout berhasil dibuat." action={<Link href="/katalog" className="button-primary"><Package size={15} />Mulai Belanja</Link>} />}</div>;
}
