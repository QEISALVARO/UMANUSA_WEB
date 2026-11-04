import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { CopyReferral, DashboardNav } from "@/components/dashboard-controls";
import { ROLE_LABELS } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk?next=/dashboard");
  return (
    <main className="min-h-screen bg-[#f3f4ef] py-8 lg:py-10"><div className="container-wide grid items-start gap-7 lg:grid-cols-[235px_1fr]"><aside className="rounded-2xl border border-navy/10 bg-white p-4 lg:sticky lg:top-28"><div className="border-b border-navy/10 px-2 pb-5 pt-2"><p className="text-[9px] uppercase tracking-[.17em] text-slate-400">Ruang kerja pribadi</p><p className="mt-2 truncate font-serif text-xl font-semibold">{user.name}</p><span className="badge badge-green mt-3">{ROLE_LABELS[user.role]}</span></div><div className="py-4"><DashboardNav role={user.role} /></div><div className="space-y-3 border-t border-navy/10 px-1 pt-4">{["reseller", "agent", "distributor"].includes(user.role) && <CopyReferral code={user.referralCode} />}<Link href="/katalog" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-cream"><ShoppingBag size={16} />Belanja di katalog</Link><form action={logoutAction}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"><LogOut size={16} />Keluar akun</button></form></div></aside><div className="min-w-0">{children}</div></div></main>
  );
}
