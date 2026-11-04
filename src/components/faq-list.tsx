"use client";

import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export function FaqList({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState(0);
  return <div className="divide-y divide-navy/10 border-y border-navy/10">{items.map((item, index) => <div key={item.question}><button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left" aria-expanded={open === index}><span className="font-serif text-lg font-semibold text-navy sm:text-xl">{item.question}</span><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${open === index ? "bg-emerald-800 text-white" : "bg-cream text-emerald-800"}`}>{open === index ? <Minus size={15} /> : <Plus size={15} />}</span></button><AnimatePresence initial={false}>{open === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }} className="overflow-hidden"><p className="max-w-3xl pb-6 pr-10 text-sm leading-7 text-slate-600">{item.answer}</p></motion.div>}</AnimatePresence></div>)}</div>;
}
