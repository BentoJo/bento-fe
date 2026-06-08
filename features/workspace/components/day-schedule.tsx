"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { cairo } from "@/shared/lib/fonts";
import Schedule from "@/shared/components/svgs/Schedule";
import Timer from "@/shared/components/svgs/Timer";

/* ─────────────────────────────────────────
   Generate hourly slots 12:00 AM → 11:00 PM
   Edit START_HOUR / END_HOUR to change range
───────────────────────────────────────── */
function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    const period = h < 12 ? "AM" : "PM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    slots.push(`${String(hour).padStart(2, "0")}:00 ${period}`);
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

/* ─────────────────────────────────────────
   Today's date label  e.g. "Saturday , Jun 27 , 2026"
───────────────────────────────────────── */
function getTodayLabel(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).replace(/,([^,]*)$/, " ,$1").replace(",", " ,");
}

export function DaySchedulePanel() {
  const dateLabel = getTodayLabel();

  return (
    <Card
      className="shadow-sm w-2/3 h-[735px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: 0,
      }}
    >
      {/* ── Header ── */}
      <CardHeader className="flex flex-row items-start justify-between px-6 pt-5 pb-3">
        <div className="flex flex-col gap-1">
           <CardTitle className={`flex items-center gap-2 text-[24px] ${cairo.className} font-bold text-[#0F172A]`}>
          <Schedule className="size-4" />
          Last week progress
        </CardTitle>
          <p className={`${cairo.className} text-[14px] font-bold text-[#0F172A]`}>
            {dateLabel}
          </p>
        </div>

        <Button
          className={`${cairo.className} gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-5 py-2.5 rounded-[10px] text-[14px]`}
        >
          <Plus className="size-4" />
          Add Event
        </Button>
      </CardHeader>

      {/* ── Time slots ── */}
      <CardContent className="px-0 pb-0 pt-0">
        <div className="flex flex-col">
          {TIME_SLOTS.map((slot, index) => (
            <div
              key={slot}
              className="flex items-center gap-0 border-t"
              style={{
                borderColor: "#EFF3F8",
                background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                minHeight: 54,
              }}
            >
              {/* Time label */}
              <span
                className={`${cairo.className} text-[12px] text-[#64748B] font-bold w-[100px] shrink-0 pl-6`}
              >
                {slot}
              </span>

              {/* Event area — empty for now, events can be injected here */}
              <div className="flex-1 pr-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}