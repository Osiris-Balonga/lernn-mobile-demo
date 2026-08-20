import * as React from "react"

import { cn } from "@/lib/utils"

type ScrollDirection = "idle" | "up" | "down"

type UseMobileFloatingVisibilityOptions = {
  enabled?: boolean
  minScrollY?: number
  scrollContainerRef?: React.RefObject<HTMLElement | null>
  threshold?: number
}

function getWindowScrollY() {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

function useMobileFloatingVisibility({
  enabled = true,
  minScrollY = 24,
  scrollContainerRef,
  threshold = 8,
}: UseMobileFloatingVisibilityOptions = {}) {
  const [hidden, setHidden] = React.useState(false)
  const [direction, setDirection] = React.useState<ScrollDirection>("idle")
  const lastYRef = React.useRef(0)
  const frameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!enabled) {
      setHidden(false)
      setDirection("idle")
      return
    }

    const scrollContainer = scrollContainerRef?.current
    const target: Window | HTMLElement = scrollContainer ?? window
    const getScrollY = () =>
      Math.max(
        0,
        scrollContainer ? scrollContainer.scrollTop : getWindowScrollY()
      )

    lastYRef.current = getScrollY()

    const update = () => {
      frameRef.current = null

      const nextY = getScrollY()
      const delta = nextY - lastYRef.current

      if (Math.abs(delta) < threshold) {
        return
      }

      const nextDirection: ScrollDirection = delta > 0 ? "down" : "up"

      setDirection(nextDirection)
      setHidden(nextDirection === "down" && nextY > minScrollY)
      lastYRef.current = nextY
    }

    const handleScroll = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(update)
      }
    }

    target.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      target.removeEventListener("scroll", handleScroll)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [enabled, minScrollY, scrollContainerRef, threshold])

  return { direction, hidden }
}

type MobileFloatingPosition = "bottom" | "top"
type MobileFloatingAlign = "center" | "stretch"
type MobileFloatingVariant = "bar" | "plain"

type MobileFloatingBarProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "role"
> &
  UseMobileFloatingVisibilityOptions & {
    align?: MobileFloatingAlign
    containerClassName?: string
    hideOnScroll?: boolean
    position?: MobileFloatingPosition
    role?: React.AriaRole
    variant?: MobileFloatingVariant
  }

const positionClassName: Record<MobileFloatingPosition, string> = {
  bottom: "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
  top: "top-[calc(1rem+env(safe-area-inset-top))]",
}

const hiddenClassName: Record<MobileFloatingPosition, string> = {
  bottom: "translate-y-[calc(100%+1.5rem)]",
  top: "-translate-y-[calc(100%+1.5rem)]",
}

const alignClassName: Record<MobileFloatingAlign, string> = {
  center: "justify-center px-5",
  stretch: "items-stretch px-5",
}

const variantClassName: Record<MobileFloatingVariant, string> = {
  bar: "flex w-full items-center gap-2 rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur",
  plain: "flex w-full items-center gap-2",
}

function MobileFloatingBar({
  align = "stretch",
  "aria-label": ariaLabel,
  children,
  className,
  containerClassName,
  hideOnScroll = true,
  minScrollY,
  onBlurCapture,
  onFocusCapture,
  position = "bottom",
  role = "group",
  scrollContainerRef,
  threshold,
  variant = "bar",
  ...props
}: MobileFloatingBarProps) {
  const [focusWithin, setFocusWithin] = React.useState(false)
  const { direction, hidden } = useMobileFloatingVisibility({
    enabled: hideOnScroll,
    minScrollY,
    scrollContainerRef,
    threshold,
  })
  const isHidden = hidden && !focusWithin

  return (
    <div
      aria-hidden={isHidden}
      className={cn(
        "mobile-device-shell pointer-events-none fixed inset-x-0 z-40 mx-auto flex transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        positionClassName[position],
        alignClassName[align],
        isHidden ? hiddenClassName[position] : "translate-y-0",
        isHidden ? "opacity-0" : "opacity-100",
        containerClassName
      )}
      data-scroll-direction={direction}
      data-hidden={isHidden}
      inert={isHidden ? true : undefined}
    >
      <div
        aria-label={ariaLabel}
        className={cn(
          "pointer-events-auto",
          variantClassName[variant],
          className
        )}
        onBlurCapture={(event) => {
          onBlurCapture?.(event)

          if (
            !(
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            )
          ) {
            setFocusWithin(false)
          }
        }}
        onFocusCapture={(event) => {
          onFocusCapture?.(event)
          setFocusWithin(true)
        }}
        role={role}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export { MobileFloatingBar, useMobileFloatingVisibility }
export type {
  MobileFloatingAlign,
  MobileFloatingBarProps,
  MobileFloatingPosition,
  MobileFloatingVariant,
  ScrollDirection,
  UseMobileFloatingVisibilityOptions,
}
