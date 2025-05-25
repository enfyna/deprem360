"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg shadow-md"
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
