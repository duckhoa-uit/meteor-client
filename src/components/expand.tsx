import React, { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import useRealShape from "@/hooks/use-real-shape"

export type ExpandProps = {
  isExpanded?: boolean
  delay?: number
}

const defaultProps: ExpandProps = {
  isExpanded: false,
  delay: 200,
}

const Expand: React.FC<React.PropsWithChildren<ExpandProps>> = ({
  isExpanded = false,
  delay = 200,
  children,
}: React.PropsWithChildren<ExpandProps> & typeof defaultProps) => {
  const [height, setHeight] = useState<"auto" | "0" | string>(
    isExpanded ? "auto" : "0"
  )
  const [selfExpanded, setSelfExpanded] = useState<boolean>(isExpanded)
  const [visible, setVisible] = useState<boolean>(isExpanded)

  const contentRef = useRef<HTMLDivElement>(null)
  const [state, updateShape] = useRealShape<HTMLDivElement>(contentRef)

  const entryTimer = useRef<number>()
  const leaveTimer = useRef<number>()
  const resetTimer = useRef<number>()

  useEffect(() => setHeight(`${state.height}px`), [state.height])

  useEffect(() => {
    // show element or reset height.
    // force an update once manually, even if the element does not change.
    // (the height of the element might be "auto")
    if (isExpanded) {
      setVisible(isExpanded)
    } else {
      updateShape()
      setHeight(`${state.height}px`)
    }

    // show expand animation
    entryTimer.current = window.setTimeout(() => {
      setSelfExpanded(isExpanded)
      clearTimeout(entryTimer.current)
    }, 30)

    // Reset height after animation
    if (isExpanded) {
      resetTimer.current = window.setTimeout(() => {
        setHeight("auto")
        clearTimeout(resetTimer.current)
      }, delay)
    } else {
      leaveTimer.current = window.setTimeout(() => {
        setVisible(isExpanded)
        clearTimeout(leaveTimer.current)
      }, delay / 2)
    }

    return () => {
      clearTimeout(entryTimer.current)
      clearTimeout(leaveTimer.current)
      clearTimeout(resetTimer.current)
    }
  }, [isExpanded])

  return (
    <div
      className={cn(
        "visible m-0 max-h-0 overflow-hidden p-0 transition-[max-height]",
        `duration-[${delay}ms]`,
        visible ? "visible" : "invisible",
        selfExpanded
          ? ` visible ${height === "auto" ? "max-h-fit" : `max-h-[${height}]`} `
          : "max-h-0"
      )}
      style={{
        transition: `max-height ${delay}ms ease`,
      }}
    >
      <div ref={contentRef} className="flex h-auto flex-col">
        {children}
      </div>
      {/* <style jsx>{`
        .container {
          padding: 0;
          margin: 0;
          height: 0;
          overflow: hidden;
          visibility: ${visible ? "visible" : "hidden"};
          transition: height ${delay}ms ease;
        }

        .expanded {
          height: ${height};
          visibility: visible;
        }
      `}</style> */}
    </div>
  )
}

Expand.defaultProps = defaultProps
Expand.displayName = "GeistExpand"
export default Expand
