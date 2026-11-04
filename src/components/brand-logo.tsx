import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" fill="none" className={className} aria-hidden="true">
      <path d="M7 16h12v25c0 9 5 14 13 14s13-5 13-14V16h12v26c0 16-10 25-25 25S7 58 7 42V16Z" fill="currentColor" />
      <path d="M12 8c9 3 15 10 16 22-10-1-17-8-16-22Z" fill="#C9A24A" />
      <path d="M52 8c-9 3-15 10-16 22 10-1 17-8 16-22Z" fill="#C9A24A" />
      <path d="M32 29c-8 5-11 13-9 24 9-3 14-11 9-24Z" fill="#F8F5E9" fillOpacity=".92" />
      <path d="m32 0 2.5 6.5L41 9l-6.5 2.5L32 18l-2.5-6.5L23 9l6.5-2.5L32 0Z" fill="#D4AF37" />
      <path d="M3 62c10 8 48 8 58 0-8 12-50 12-58 0Z" fill="#C9A24A" />
    </svg>
  );
}

export function BrandLogo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-10 w-9 shrink-0", light ? "text-white" : "text-[#087F63]")} />
      <span className="leading-none">
        <span className={cn("block text-[1.35rem] font-black tracking-[0.055em]", light ? "text-white" : "text-[#152C42]")}>UMANUSA</span>
        <span className={cn("mt-1 block text-[0.47rem] font-bold tracking-[0.14em]", light ? "text-white/65" : "text-[#087F63]")}>UMAT BERDAYA, NUSANTARA SEJAHTERA</span>
      </span>
    </span>
  );
}
