import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import useDdpConnectionStore from "@/store";
import { DdpConnection, Endpoint } from "@/store/types";



import { cn } from "@/lib/utils";



import CloseableTabs from "../closeable-tabs";
import DdpEndpoint from "../ddp-client/ddp-endpoint";
import ServerConnection, { ServerConnectionRef } from "../server-connection";


interface EndpointViewProps {
  connection: DdpConnection
  selected: boolean
}
export type EndpointViewRef = {
  updateSelectedTab: (data: Endpoint) => void
}
const EndpointView = forwardRef<EndpointViewRef, EndpointViewProps>(
  ({ connection, selected = false }, ref) => {
    const {
      initializeOpenEndpoints,
      addOpenEndpointToConnection,
      removeOpenEndpointOfConnection,
    } = useDdpConnectionStore.getState()

    if (connection.openEndpoints.length === 0) {
      // Initialize open endpoints when component is mounted
      initializeOpenEndpoints(connection.title)
    }

    const serverRef = useRef<ServerConnectionRef>(null)

    const [endpointTab, setEndpointTab] = useState(
      connection.openEndpoints.length > 0 ? connection.openEndpoints[0].id : ""
    )

    const updateSelectedTabHandler = (data: Endpoint) => {
      const endpointId = connection.openEndpoints.find(
        (openEndpoint) => openEndpoint.id === data.id
      )?.id

      if (endpointId) {
        setEndpointTab(endpointId)
      }
    }

    useImperativeHandle(ref, () => {
      return {
        updateSelectedTab: updateSelectedTabHandler,
      }
    })

    useEffect(() => {
      if (!endpointTab && connection.openEndpoints.length) {
        setEndpointTab(connection.openEndpoints[0].id)
      }
    }, [connection.openEndpoints])

    const handleAddEndpoint = () => {
      addOpenEndpointToConnection(connection.title)
    }

    const handleRemoveEndpoint = (endpoint: Endpoint) => {
      removeOpenEndpointOfConnection(connection.title, endpoint.id)
    }

    const getTabContent = (endpoint: Endpoint, isSelected: boolean) => (
      <DdpEndpoint
        key={endpoint.id}
        isActive={isSelected}
        serverConnectionRef={serverRef.current}
        connection={connection}
        endpoint={endpoint}
      />
    )

    return (
      <div
        className={cn(
          "h-[calc(100vh-120px)]",
          connection.title,
          selected ? null : "hidden"
        )}
      >
        <ServerConnection ref={serverRef} />
        <CloseableTabs
          containerClassName={cn("mt-5")}
          tabKey={endpointTab}
          tabs={connection.openEndpoints}
          isTabSelected={(item) => endpointTab === item.id}
          getTabTitle={(tab) => tab.title!}
          getTabContent={getTabContent}
          onSelectTab={(tab) => setEndpointTab(tab.id)}
          onRemoveTab={(tab) => handleRemoveEndpoint(tab)}
          onAddTab={handleAddEndpoint}
        />
      </div>
    )
  }
)
export default EndpointView