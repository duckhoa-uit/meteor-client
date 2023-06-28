import cloneDeep from "lodash/cloneDeep"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { removeItemAtIndex, replaceItemAtIndex } from "@/lib/utils"

import {
  DdpConnection,
  DdpConnectionCollection,
  EndpointArg,
  StateProps,
} from "./types"

const useDdpConnectionStore = create<StateProps>((set, get) => ({
  ddpConnections: [],
  updateDdpConnections: (ddpConnections: DdpConnection[]) => {
    set({ ddpConnections })
  },
  initializeConnections: () => {
    const id = "endpoint-" + 1
    const endpointName = "Endpoint " + 1

    const initConnection: DdpConnection = {
      title: "Connection 1",
      collections: [],
      openEndpoints: [
        {
          id,
          title: endpointName,
          description: null,
          args: [],
        },
      ],
    }

    set(() => ({ ddpConnections: [initConnection] }))
  },
  addConnection: () => {
    const connections = get().ddpConnections
    console.log(
      "🚀 ~ file: index.ts:40 ~ useDdpConnectionStore ~ connections:",
      connections
    )

    let i = 1
    let connectionName = "Connection " + i
    while (
      connections.find((connection) => connection.title === connectionName)
    ) {
      i++
      connectionName = "Connection " + i
    }

    const id = "endpoint-" + 1
    const endpointName = "Endpoint " + 1

    const newConnection: DdpConnection = {
      title: connectionName,
      collections: [],
      openEndpoints: [
        {
          id,
          title: endpointName,
          description: null,
          args: [],
        },
      ],
    }

    set({ ddpConnections: [...connections, newConnection] })
  },
  removeConnection: (connectionName: string) => {
    const connections = get().ddpConnections

    if (connections.length > 1) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )

      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not delete item. Index out of bounds.")
      }

      set({ ddpConnections: removeItemAtIndex(connections, connectionIndex) })
    }
  },
  addCollectionToConnection: (
    connectionName: string,
    collection: DdpConnectionCollection
  ) => {
    const connections = get().ddpConnections

    if (connections.length > 1) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )

      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not add item. Index out of bounds.")
      }
      const foundItem = connections[connectionIndex]

      foundItem.collections.push({ ...collection, id: collection.name })

      set({
        ddpConnections: replaceItemAtIndex(
          connections,
          connectionIndex,
          foundItem
        ),
      })
    }
  },
  removeCollectionOfConnection: (
    connectionName: string,
    collectionIndex: number
  ) => {
    const connections = get().ddpConnections

    if (connections.length > 1) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )

      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not delete item. Index out of bounds.")
      }
      const foundItem = connections[connectionIndex]

      foundItem.collections.splice(collectionIndex, 1)

      set({
        ddpConnections: replaceItemAtIndex(
          connections,
          connectionIndex,
          foundItem
        ),
      })
    }
  },

  // ENDPOINTS
  initializeOpenEndpoints: (connectionName: string) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex === 0) {
      const connection = connections[connectionIndex]
      if (connection.openEndpoints.length === 0) {
        const id = "endpoint-" + 1
        const endpointName = "Endpoint " + 1

        const newConnection = cloneDeep(connection)
        newConnection.openEndpoints = [
          {
            id,
            title: endpointName,
            description: null,
            args: [],
          },
        ]

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            newConnection
          ),
        })
      }
    }
  },
  addOpenEndpointToConnection: (connectionName: string) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const connection = connections[connectionIndex]

      let i = 1
      let endpointName = "Endpoint " + i
      while (
        connection.openEndpoints.find(
          (endpoint) => endpoint.title === endpointName
        )
      ) {
        i++
        endpointName = "Endpoint " + i
      }
      const id = "endpoint-" + i

      const newConnection = cloneDeep(connection)
      newConnection.openEndpoints.push({
        id,
        title: endpointName,
        description: null,
        args: [],
      })

      set({
        ddpConnections: replaceItemAtIndex(
          connections,
          connectionIndex,
          newConnection
        ),
      })
    }
  },
  removeOpenEndpointOfConnection: (
    connectionName: string,
    openEndpointId: string
  ) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const connection = connections[connectionIndex]
      if (connection.openEndpoints.length > 0) {
        const endpointIndex = connection.openEndpoints.findIndex(
          (openEndpoint) => openEndpoint.id === openEndpointId
        )
        const newConnection = cloneDeep(connection)
        newConnection.openEndpoints.splice(endpointIndex, 1)

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            newConnection
          ),
        })
      }
    }
  },
  saveNameOfOpenEndpoint: ({
    connectionName,
    openEndpointId,
    name,
    endpointType,
  }: {
    connectionName: string
    openEndpointId: string
    name: string
    endpointType: string
  }) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const connection = connections[connectionIndex]

      const oldConnection = cloneDeep(connection)
      if (oldConnection.openEndpoints.length > 0) {
        oldConnection.openEndpoints.forEach((endpoint) => {
          if (endpoint.id === openEndpointId) {
            // TODO: chua hieu
            // endpoint.name = name
            // endpoint.endpointType = endpointType
          }
        })

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            oldConnection
          ),
        })
      }
    }
  },
  saveArgOfOpenEndpoint: ({
    connectionName,
    openEndpointId,
    index,
    arg,
  }: {
    connectionName: string
    openEndpointId: string
    index: number
    arg: EndpointArg
  }) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const connection = connections[connectionIndex]

      const oldConnection = cloneDeep(connection)
      if (oldConnection.openEndpoints.length > 0) {
        oldConnection.openEndpoints.forEach((openEndpoint) => {
          if (openEndpoint.id === openEndpointId) {
            openEndpoint.args[index] = arg
          }
        })

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            oldConnection
          ),
        })
      }
    }
  },
  removeArgOfOpenEndpoint: ({
    connectionName,
    openEndpointId,
    argIndex,
  }: {
    connectionName: string
    openEndpointId: string
    argIndex: number
  }) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const connection = connections[connectionIndex]

      const oldConnection = cloneDeep(connection)
      if (oldConnection.openEndpoints.length > 0) {
        oldConnection.openEndpoints.forEach((endpoint) => {
          if (endpoint.id === openEndpointId) {
            endpoint.args.splice(argIndex, 1)
          }
        })

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            oldConnection
          ),
        })
      }
    }
  },
}))

export default useDdpConnectionStore
