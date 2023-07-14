import React, { useCallback, useEffect, useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection } from "@/store/types"

import "allotment/dist/style.css"

import CloseableTabs from "../closeable-tabs"
import ConnectionView from "../connection-view"

const LayoutSPA: React.FC = () => {
  const { addConnection, removeConnection, initializeConnections } =
    useDdpConnectionStore.getState()
  const ddpConnections = useDdpConnectionStore((state) => state.ddpConnections)

  // Initialize connections when component is mounted
  if (ddpConnections.length === 0) {
    initializeConnections()
  }

  const [connectionTab, setConnectionTab] = useState("")

  useEffect(() => {
    if (!connectionTab && ddpConnections.length) {
      setConnectionTab(ddpConnections[0].title)
    }
  }, [ddpConnections])

  const handleAddDdpConnection = async () => {
    addConnection()
  }

  const handleRemoveDdpConnection = (connection: DdpConnection) => {
    if (ddpConnections.length > 1) {
      removeConnection(connection.title)
    }
  }

  const getTabContent = useCallback(
    (tab: DdpConnection, isSelected: boolean) => (
      <ConnectionView key={tab.title} tab={tab} isSelected={isSelected} />
    ),
    [connectionTab]
  )

  const isTabSelected = useCallback(
    (item: DdpConnection) => connectionTab === item.title,
    [connectionTab]
  )

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden">
      <div className="">
        <CloseableTabs
          tabKey={connectionTab}
          tabs={ddpConnections}
          isTabSelected={isTabSelected}
          getTabTitle={(tab) => tab.title}
          getTabContent={getTabContent}
          onSelectTab={(tab) => setConnectionTab(tab.title)}
          onRemoveTab={handleRemoveDdpConnection}
          onAddTab={handleAddDdpConnection}
        />
      </div>
    </div>
  )
}

export default LayoutSPA
