import React from "react"

import { cn } from "@/lib/utils"

interface Props {
  count: number
}

const TreeIndents: React.FC<Props> = ({ count }) => {
  if (count === 0) return null
  return (
    <>
      {[...new Array(count)].map((_, index) => (
        <span
          className={cn(
            "absolute top-1/2 ml-[-1px] h-full w-[1px] -translate-y-1/2 bg-muted"
          )}
          style={{
            left: `calc(-1.875rem * ${index + 1} + 0.75rem)`,
          }}
          key={`indent-${index}`}
        />
      ))}
    </>
  )
}

export default TreeIndents
