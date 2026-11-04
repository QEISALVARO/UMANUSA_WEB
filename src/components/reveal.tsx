"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0, direction = "up" }: { children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "none" }) {
  const reduce = useReducedMotion();
  const offset = direction === "left" ? { x: -36, y: 0 } : direction === "right" ? { x: 36, y: 0 } : direction === "none" ? { x: 0, y: 0 } : { x: 0, y: 34 };
  return (
    <motion.div
      className={cn(className)}
      initial={reduce ? { opacity: 1 } : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>{children}</motion.div>;
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} variants={{ hidden: { opacity: 0, y: 28, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } }}>{children}</motion.div>;
}
