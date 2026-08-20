"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface ComboboxOption {
  value: string
  label: string
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results.",
  className,
  contentClassName,
  renderOption,
  renderValue,
}: {
  value: string
  onValueChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  /** Extra classes applied to the PopoverContent (e.g. override min-width) */
  contentClassName?: string
  /** Custom renderer for each option row in the dropdown */
  renderOption?: (option: ComboboxOption) => React.ReactNode
  /** Custom renderer for the selected value shown in the trigger */
  renderValue?: (option: ComboboxOption) => React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const filtered = React.useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(lower))
  }, [options, search])

  const selected = options.find((opt) => opt.value === value)

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between overflow-hidden font-normal",
            className
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            {selected ? (
              renderValue ? (
                renderValue(selected)
              ) : (
                <span className="truncate">{selected.label}</span>
              )
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("gap-0 p-0", contentClassName)}
        align="start"
        style={{
          minWidth: "200px",
          maxWidth: "320px",
        }}
      >
        <div className="border-b border-border p-2">
          <Input
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-sm"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onValueChange(opt.value)
                  setOpen(false)
                  setSearch("")
                }}
                className={cn(
                  "relative flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm outline-none select-none",
                  opt.value === value
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-3.5 w-3.5 shrink-0",
                    opt.value === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {renderOption ? renderOption(opt) : opt.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
