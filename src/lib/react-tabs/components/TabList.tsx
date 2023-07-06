import { cn } from "@/lib/utils"

import { ReactTabsFunctionComponent, TabListProps } from "../types"

const defaultProps = {
  className: "react-tabs__tab-list",
}
const TabList: ReactTabsFunctionComponent<TabListProps> = (props) => {
  const { children, className, ...attributes } = {
    ...defaultProps,
    ...props,
  }

  return (
    <ul {...attributes} className={cn(className)} role="tablist">
      {children}
    </ul>
  )
}

TabList.tabsRole = "TabList"

export default TabList
