import React, { useCallback, useEffect, useRef, useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection, Endpoint } from "@/store/types"

import { cn } from "@/lib/utils"

import CloseableTabs from "./closeable-tabs"
import DdpEndpoint from "./ddp-client/ddp-endpoint"
import ServerConnection, { ServerConnectionRef } from "./server-connection"

interface HomeProps {
  connection: DdpConnection
  selected: boolean
}
const Home: React.FC<HomeProps> = ({ connection, selected = false }) => {
  const {
    initializeOpenEndpoints,
    addOpenEndpointToConnection,
    removeOpenEndpointOfConnection,
  } = useDdpConnectionStore.getState()

  const serverRef = useRef<ServerConnectionRef>(null)

  const [endpointTab, setEndpointTab] = useState(
    connection.openEndpoints.length > 0 ? connection.openEndpoints[0].id : ""
  )

  // TODO: switch tab on tree
  // useEffect(() => {
  //   const updateSelectedTabHandler = (data: any) => {
  //     setEndpointTab(
  //       connection.openEndpoints.find(
  //         (openEndpoint) => openEndpoint.id === data.id
  //       )?.id ?? ""
  //     )
  //   }

  //   // Subscribe to the event
  //   const rootInstance = document.querySelector("#app") as any // Replace '#app' with your root element selector
  //   rootInstance.$root.$on("updateSelectedTab", updateSelectedTabHandler)

  //   return () => {
  //     // Unsubscribe from the event
  //     rootInstance.$root.$off("updateSelectedTab", updateSelectedTabHandler)
  //   }
  // }, [connection.openEndpoints])

  useEffect(() => {
    // Initialize open endpoints when component is mounted
    // initializeOpenEndpoints(connection.title)

    setEndpointTab(connection.openEndpoints[0].id)
  }, [])

  const handleAddEndpoint = () => {
    addOpenEndpointToConnection(connection.title)
  }

  const handleRemoveEndpoint = (endpoint: Endpoint) => {
    removeOpenEndpointOfConnection(connection.title, endpoint.id)
  }

  const getTabContent = useCallback(
    (endpoint: Endpoint, isSelected: boolean) => (
      <DdpEndpoint
        key={endpoint.id}
        isActive={isSelected}
        connection={serverRef.current}
        ddpConnection={connection}
        endpoint={endpoint}
      />
    ),
    []
  )

  return (
    <div className={cn("h-[calc(100vh-120px)]", selected ? null : "hidden")}>
      <ServerConnection ref={serverRef} />
      <CloseableTabs
        containerClassName={cn("mt-5")}
        tabKey={endpointTab}
        tabs={connection.openEndpoints}
        isTabSelected={(item) => endpointTab === item.id}
        getTabTitle={(tab) => tab.title}
        getTabContent={getTabContent}
        onUpdateTabs={() => {}}
        onSelectTab={(tab) => setEndpointTab(tab.id)}
        onRemoveTab={(tab) => handleRemoveEndpoint(tab)}
        onAddTab={handleAddEndpoint}
      />
    </div>
  )
}

export default Home
