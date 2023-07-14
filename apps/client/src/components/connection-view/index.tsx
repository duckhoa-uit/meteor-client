import React, { useRef } from "react"
import { DdpConnection, Endpoint } from "@/store/types"
import { Allotment } from "allotment"

import { cn } from "@/lib/utils"

import AsideView from "../aside-view"
import EndpointView, { EndpointViewRef } from "../endpoint-view"

const ConnectionView = ({
  tab,
  isSelected,
}: {
  tab: DdpConnection
  isSelected: boolean
}) => {
  const ref = useRef<EndpointViewRef>(null)

  const handleUpdateSelectedTab = (tab: Endpoint) => {
    ref.current?.updateSelectedTab(tab)
  }

  return (
    <Allotment
      className={cn(isSelected ? "h-[calc(100vh)]" : null)}
      key={tab.title}
      vertical={false}
    >
      <Allotment.Pane preferredSize={"25%"}>
        <AsideView
          connection={tab}
          updateSelectedTab={handleUpdateSelectedTab}
        />
      </Allotment.Pane>
      <Allotment.Pane preferredSize={"75%"} snap>
        <EndpointView ref={ref} connection={tab} selected={isSelected} />
      </Allotment.Pane>
    </Allotment>
  )
}

export default ConnectionView
