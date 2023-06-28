import React, { useEffect, useRef, useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection, Endpoint } from "@/store/types"

import CloseableTabs from "./closeable-tabs"
import DdpEndpoint from "./ddp-client/ddp-endpoint"
import ServerConnection, { ServerConnectionRef } from "./server-connection"

interface HomeProps {
  connection: DdpConnection
}
const Home: React.FC<HomeProps> = ({ connection }) => {
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
    initializeOpenEndpoints(connection.title)

    setEndpointTab(connection.openEndpoints[0].id)
  }, [])

  const handleAddEndpoint = () => {
    addOpenEndpointToConnection(connection.title)
  }

  const handleRemoveEndpoint = (endpoint: Endpoint) => {
    removeOpenEndpointOfConnection(connection.title, endpoint.id)
  }

  // TODO: add auto focus
  // useEffect(() => {
  //   const responseView = document.querySelectorAll(
  //     ".ace-jsoneditor .ace_text-input"
  //   )[0]
  //   if (responseView) {
  //     responseView.focus()
  //   }
  // }, [endpointTab])

  return (
    <div className="h-[calc(100vh-120px)]">
      <ServerConnection ref={serverRef} />
      <CloseableTabs
        containerClassName="mt-5"
        tabKey={endpointTab}
        tabs={connection.openEndpoints}
        isTabSelected={(item) => endpointTab === item.id}
        getTabTitle={(tab) => tab.title}
        getTabContent={() => {
          const endpoint = connection.openEndpoints.find(
            (_) => _.id === endpointTab
          )
          if (!endpoint) return <></>

          return (
            <DdpEndpoint
              connection={serverRef.current}
              ddpConnection={connection}
              endpoint={endpoint}
            />
          )
        }}
        onUpdateTabs={() => {}}
        onSelectTab={(tab) => setEndpointTab(tab.id)}
        onRemoveTab={(tab) => handleRemoveEndpoint(tab)}
        onAddTab={handleAddEndpoint}
      />
      {/* <Tabs value={endpointTab} className="mt-5">
        <TabsList>
          {connection.openEndpoints.map((endpoint, idx) => (
            <TabsTrigger
              value={endpoint.id}
              key={`${endpoint.id}_${idx}`}
              className="endpoint-tab"
              onClick={() => setEndpointTab(endpoint.id)}
            >
              {endpoint.title}
              <Icons.close
                className="ml-2 h-4 w-4 transition hover:text-primary"
                onClick={() => handleRemoveEndpoint(endpoint)}
              />
            </TabsTrigger>
          ))}
          <Button variant={"link"} onClick={handleAddEndpoint}>
            <Icons.add />
          </Button>
        </TabsList>

        {connection.openEndpoints.map((endpoint) => (
          <TabsContent key={endpoint.id} value={endpointTab}>
            <DdpEndpoint
              connection={serverRef.current}
              ddpConnection={connection}
              endpoint={endpoint}
            />
          </TabsContent>
        ))}
      </Tabs> */}
    </div>
  )
}

export default Home
