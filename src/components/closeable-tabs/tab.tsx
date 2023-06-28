import { motion, Reorder } from "framer-motion"

import { cn } from "@/lib/utils"

import { Icons } from "../icons"

interface Props<T> {
  item: T
  label: string
  isSelected: boolean
  onClick: () => void
  onRemove: () => void
}

export function Tab<T>({
  item,
  onClick,
  onRemove,
  isSelected,
  label,
}: Props<T>) {
  return (
    <Reorder.Item
      id={label}
      value={item}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        backgroundColor: isSelected
          ? "hsl(var(--accent))"
          : "var(--primary-color)",
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      whileDrag={{ backgroundColor: "#e3e3e3" }}
      className={cn(
        "relative flex w-full min-w-0 flex-1 cursor-pointer select-none items-center justify-between overflow-hidden rounded-t-sm bg-white px-4 py-2 dark:bg-transparent"
      )}
      onPointerDown={onClick}
    >
      <motion.span
        layout="position"
        className="block min-w-0 flex-1 whitespace-nowrap pr-7 leading-4 gradient-mask-r-0"
      >
        {label}
      </motion.span>
      <motion.div
        layout
        className="absolute inset-y-0 right-2 flex shrink-0 items-center justify-end"
      >
        <motion.button
          className="ml-2 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-white stroke-black dark:bg-transparent"
          onPointerDown={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          initial={false}
          animate={{
            backgroundColor: isSelected
              ? "hsl(var(--muted))"
              : "hsl(var(--muted))",
          }}
        >
          <Icons.close className="h-4 w-4 transition hover:text-primary" />
        </motion.button>
      </motion.div>
    </Reorder.Item>
  )
}
