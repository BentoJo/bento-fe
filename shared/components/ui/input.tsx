import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn( 
        "h-9 w-full min-w-0 px-2.5 py-1 text-base font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { Input }
