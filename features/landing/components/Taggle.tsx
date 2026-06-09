import { cairo } from "@/shared/lib/fonts";
import { useState } from "react";

function ToggleRow({ item }: { item: ToggleItem }) {
  const [enabled, setEnabled] = useState(item.defaultOn ?? false);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="max-w-[280px]">
        <p
          className={`${cairo.className} text-[14px] font-bold text-[#0F172A]`}
        >
          {item.label}
        </p>

        <p className="mt-1 text-[11px] leading-[16px] text-[#64748B]">
          {item.description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        role="switch"
        aria-checked={enabled}
        className={cn(
          "relative mt-1 h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
          enabled ? "bg-[#2563EB]" : "bg-[#DBEAFE]"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] h-3 w-3 rounded-full bg-white transition-all duration-200",
            enabled ? "right-[2px]" : "left-[2px]"
        
          )}
        />
      </button>
    </div>
  );
}