import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import { ReactTabsFunctionComponent, TabProps } from "../types"

const DEFAULT_CLASS = "react-tabs__tab"
const defaultProps = {
  className: DEFAULT_CLASS,
  disabledClassName: `${DEFAULT_CLASS}--disabled`,
  focus: false,
  id: null,
  selected: false,
  selectedClassName: `${DEFAULT_CLASS}--selected`,
}

const Tab: ReactTabsFunctionComponent<TabProps> = (props) => {
  let nodeRef = useRef<HTMLLIElement | null>(null)
  const {
    children,
    className,
    disabled,
    disabledClassName,
    focus,
    id,
    selected,
    selectedClassName,
    tabIndex,
    tabRef,
    ...attributes
  } = {
    ...defaultProps,
    ...props,
  }

  useEffect(() => {
    if (selected && focus && nodeRef.current) {
      nodeRef.current.focus()
    }
  }, [selected, focus])

  return (
    <li
      {...attributes}
      className={cn(
        className,
        selected ? selectedClassName : null,
        disabled ? disabledClassName : null
      )}
      ref={(node) => {
        nodeRef.current = node
        if (tabRef) tabRef(node)
      }}
      role="tab"
      id={`tab${id}`}
      aria-selected={selected ? "true" : "false"}
      aria-disabled={disabled ? "true" : "false"}
      aria-controls={`panel${id}`}
      tabIndex={tabIndex || (selected ? 0 : undefined)}
    >
      {children}
    </li>
  )
}

Tab.tabsRole = "Tab"

export default Tab
