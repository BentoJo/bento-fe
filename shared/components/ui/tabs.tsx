"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-horizontal/tabs:h-auto group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        // pill/chip style (original default)
        default: "rounded-lg bg-muted p-[3px] group-data-horizontal/tabs:h-9",
        // flat line style — white bar, active tab gets blue bottom border
        line: "rounded-[10px] bg-white gap-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      style={variant === "line" ? { border: "1px solid #E2E8F0" } : undefined}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // ── shared base ──
        "group relative inline-flex flex-1 items-center justify-center whitespace-nowrap",
        "text-sm font-semibold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

        // ── DEFAULT variant styles ──
        "group-data-[variant=line]/tabs-list:text-[#64748B]",
        "group-data-[variant=line]/tabs-list:hover:text-[#0F172A]",
        "data-[state=active]:text-[#2563EB]",
        "group-data-[variant=default]/tabs-list:rounded-md",
        "group-data-[variant=default]/tabs-list:border",
        "group-data-[variant=default]/tabs-list:border-transparent",
        "group-data-[variant=default]/tabs-list:px-2",
        "group-data-[variant=default]/tabs-list:py-1",
        "group-data-[variant=default]/tabs-list:text-foreground/60",
        "group-data-[variant=default]/tabs-list:hover:text-foreground",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-background",
        "group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground",
        "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",

        "dark:group-data-[variant=default]/tabs-list:text-muted-foreground",
        "dark:group-data-[variant=default]/tabs-list:data-[state=active]:border-input",
        "dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-input/30",

        // ── LINE variant styles ──
        "group-data-[variant=line]/tabs-list:px-5",
        "group-data-[variant=line]/tabs-list:pt-3.5",
        "group-data-[variant=line]/tabs-list:pb-0",
        "group-data-[variant=line]/tabs-list:bg-transparent",

        // inactive
        "group-data-[variant=line]/tabs-list:text-[#64748B]",
        "group-data-[variant=line]/tabs-list:hover:text-[#0F172A]",

        // active
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-[#2563EB]",

        // vertical orientation
        "group-data-vertical/tabs:w-full",
        "group-data-vertical/tabs:justify-start",

        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          {children}
        </div>

        <span
          className="
    mt-3
    h-px
    w-full
    bg-transparent
    transition-colors
    group-data-[state=active]:bg-[#2563EB]
  "
        />
      </div>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }