import { ORDER_STATUS } from "@/lib/commerce";

export function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS[status] ?? { label: status, tone: "neutral" };
  return <span className={`badge badge-${config.tone}`}>{config.label}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-navy/20 bg-white px-6 py-14 text-center"><h2 className="font-serif text-2xl">{title}</h2><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500">{text}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
