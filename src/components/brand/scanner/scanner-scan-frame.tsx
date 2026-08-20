import { cn } from "@/lib/utils"

export function ScannerScanFrame({ isActive }: { isActive: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={cn(
          "absolute top-1/2 left-1/2 aspect-square w-[70vw] max-w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
        )}
        style={{
          boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.65)",
        }}
      >
        <span
          className={cn(
            "absolute top-0 left-0 block size-8 rounded-tl-xl border-t-[3px] border-l-[3px] transition-colors duration-300",
            isActive ? "border-white" : "border-white/40"
          )}
        />
        <span
          className={cn(
            "absolute top-0 right-0 block size-8 rounded-tr-xl border-t-[3px] border-r-[3px] transition-colors duration-300",
            isActive ? "border-white" : "border-white/40"
          )}
        />
        <span
          className={cn(
            "absolute bottom-0 left-0 block size-8 rounded-bl-xl border-b-[3px] border-l-[3px] transition-colors duration-300",
            isActive ? "border-white" : "border-white/40"
          )}
        />
        <span
          className={cn(
            "absolute right-0 bottom-0 block size-8 rounded-br-xl border-r-[3px] border-b-[3px] transition-colors duration-300",
            isActive ? "border-white" : "border-white/40"
          )}
        />
        {isActive && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="block size-2 animate-ping rounded-full bg-white/60" />
          </span>
        )}
      </div>
    </div>
  )
}
