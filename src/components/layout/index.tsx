import React, { useEffect, useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection } from "@/store/types"

// import HeaderView from './shared/HeaderView';
// import AsideView from './shared/AsideView';

import CloseableTabs from "../closeable-tabs"
import Home from "../home"

const LayoutSPA: React.FC = () => {
  const {
    addConnection,
    removeConnection,
    updateDdpConnections,
    initializeConnections,
  } = useDdpConnectionStore.getState()
  const ddpConnections = useDdpConnectionStore((state) => state.ddpConnections)
  // Initialize connections when component is mounted
  if (ddpConnections.length === 0) {
    initializeConnections()
  }

  const [connectionTab, setConnectionTab] = useState("")

  useEffect(() => {
    setConnectionTab(ddpConnections[0].title)
  }, [])

  const handleAddDdpConnection = async () => {
    addConnection()
  }

  const handleRemoveDdpConnection = (connection: DdpConnection) => {
    if (ddpConnections.length > 1) {
      removeConnection(connection.title)
    }
  }

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden">
      <div className="px-3">
        <CloseableTabs
          tabKey={connectionTab}
          tabs={ddpConnections}
          isTabSelected={(item) => connectionTab === item.title}
          getTabTitle={(tab) => tab.title}
          getTabContent={() => {
            const tab = ddpConnections.find((_) => _.title === connectionTab)
            if (!tab) return <></>

            return <Home connection={tab} />
          }}
          onUpdateTabs={updateDdpConnections}
          onSelectTab={(tab) => setConnectionTab(tab.title)}
          onRemoveTab={handleRemoveDdpConnection}
          onAddTab={handleAddDdpConnection}
        />
      </div>
    </div>
  )
}

export default LayoutSPA
