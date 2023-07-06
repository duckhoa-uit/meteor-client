import { cn } from "@/lib/utils"

import { ReactTabsFunctionComponent, TabPanelProps } from "../types"

const DEFAULT_CLASS = "react-tabs__tab-panel"
const defaultProps = {
  className: DEFAULT_CLASS,
  forceRender: false,
  selectedClassName: `${DEFAULT_CLASS}--selected`,
}
const TabPanel: ReactTabsFunctionComponent<TabPanelProps> = (props) => {
  const {
    children,
    className,
    forceRender,
    id,
    selected,
    selectedClassName,
    ...attributes
  } = {
    ...defaultProps,
    ...props,
  }

  return (
    <div
      {...attributes}
      className={cn(className, selected ? selectedClassName : null)}
      role="tabpanel"
      id={`panel${id}`}
      aria-labelledby={`tab${id}`}
    >
      {forceRender || selected ? children : null}
    </div>
  )
}

TabPanel.tabsRole = "TabPanel"

export default TabPanel
