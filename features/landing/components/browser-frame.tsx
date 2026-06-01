import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface BrowserFrameProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  /** size hint forwarded to next/image for responsive loading */
  sizes?: string;
}

/**
 * Reusable faux-browser window chrome wrapping a screenshot.
 * Dark top bar with traffic-light dots + a soft layered glow behind.
 */
export function BrowserFrame({
  src,
  alt,
  width = 2400,
  height = 1500,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: BrowserFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 bottom-0 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(59,130,246,0.35),transparent_70%)] blur-2xl"
      />
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0F172A] shadow-2xl shadow-blue-950/50 ring-1 ring-white/5">
        {/* top bar */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-[#0B1220]/80 px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <div className="ml-4 hidden h-6 flex-1 items-center rounded-md border border-white/5 bg-white/5 px-3 text-[11px] text-[#64748B] sm:flex">
            app.manejo.io
          </div>
        </div>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
