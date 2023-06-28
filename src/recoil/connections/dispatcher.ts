import cloneDeep from "lodash/cloneDeep"
import { useRecoilCallback } from "recoil"

import { removeItemAtIndex, replaceItemAtIndex } from "../../lib/utils"
import { ddpConnectionsState } from "./atoms"
import { DdpConnection, DdpConnectionCollection, EndpointArg } from "./types"

export const createDispatcher = () => {
  //Connection operations

  const initializeConnections = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const connections = await snapshot.getPromise(ddpConnectionsState)

        if (connections.length === 0) {
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

          set(ddpConnectionsState, (oldTodoList: DdpConnection[]) => [
            ...oldTodoList,
            initConnection,
          ])
        }
        return
      }
  )

  const addConnection = useRecoilCallback(({ set, snapshot }) => async () => {
    const connections = await snapshot.getPromise(ddpConnectionsState)

    let i = 1
    let connectionName = "Connection " + i
    while (
      connections.find((connection) => connection.title === connectionName)
    ) {
      i++
      connectionName = "Connection " + i
    }

    const initConnection: DdpConnection = {
      title: connectionName,
      collections: [],
      openEndpoints: [],
    }

    set(ddpConnectionsState, (oldTodoList: DdpConnection[]) => [
      ...oldTodoList,
      initConnection,
    ])

    return
  })

  const removeConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      async (connectionName: string) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)

        if (connections.length > 1) {
          const connectionIndex = connections.findIndex(
            (ddpConnection) => ddpConnection.title === connectionName
          )

          if (connectionIndex < 0 || connectionIndex >= connections.length) {
            throw new Error("Could not delete item. Index out of bounds.")
          }

          set(ddpConnectionsState, (oldList) => {
            return removeItemAtIndex(oldList, connectionIndex)
          })
        }

        return
      }
  )

  const addCollectionToConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      async (connectionName: string, collection: DdpConnectionCollection) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)

        if (connections.length > 1) {
          const connectionIndex = connections.findIndex(
            (ddpConnection) => ddpConnection.title === connectionName
          )

          if (connectionIndex < 0 || connectionIndex >= connections.length) {
            throw new Error("Could not add item. Index out of bounds.")
          }
          const foundItem = connections[connectionIndex]

          foundItem.collections.push({ ...collection, id: collection.name })

          set(ddpConnectionsState, (oldList) => {
            return replaceItemAtIndex(oldList, connectionIndex, foundItem)
          })
        }
      }
  )

  const removeCollectionOfConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      async (connectionName: string, collectionIndex: number) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)

        if (connections.length > 1) {
          const connectionIndex = connections.findIndex(
            (ddpConnection) => ddpConnection.title === connectionName
          )

          if (connectionIndex < 0 || connectionIndex >= connections.length) {
            throw new Error("Could not delete item. Index out of bounds.")
          }
          const foundItem = connections[connectionIndex]

          foundItem.collections.splice(collectionIndex, 1)

          set(ddpConnectionsState, (oldList) => {
            return replaceItemAtIndex(oldList, connectionIndex, foundItem)
          })
        }
      }
  )

  //Collection operations

  // const addElementToCollection = (
  //   state,
  //   { connectionName, collectionName, element }
  // ) => {
  //   state.ddpConnections
  //     .find((ddpConnection) => ddpConnection.title === connectionName)
  //     .collections.find((collection) => collection.name === collectionName)
  //     .children.push({ ...element, id: `${collectionName}-${element.name}` })
  // }

  // const addElementToFolder = (
  //   state,
  //   { connectionName, collectionName, folderNames, element }
  // ) => {
  //   let folder = state.ddpConnections
  //     .find((ddpConnection) => ddpConnection.title === connectionName)
  //     .collections.find((collection) => collection.name === collectionName)
  //   let folderIndexes = []
  //   for (let folderLevel = 0; folderLevel < folderNames.length; folderLevel++) {
  //     const folderIndex = folder.children.findIndex(
  //       (child) =>
  //         child.type === "folder" && child.name === folderNames[folderLevel]
  //     )
  //     folderIndexes.push(folderIndex)
  //     folder = folder.children[folderIndex]
  //   }
  //   folder.children.push({
  //     ...element,
  //     id: `${collectionName}-${folderIndexes.toString().replaceAll(",", "")}-${
  //       element.name
  //     }`,
  //   })
  // }

  // const removeElementFromCollection = (
  //   state,
  //   { connectionName, collectionName, itemNames, element }
  // ) => {
  //   let item = state.ddpConnections
  //     .find((ddpConnection) => ddpConnection.title === connectionName)
  //     .collections.find((collection) => collection.name === collectionName)
  //   for (let itemLevel = 0; itemLevel < itemNames.length; itemLevel++) {
  //     item = item.children.find(
  //       (child) =>
  //         child.type === "folder" && child.name === itemNames[itemLevel]
  //     )
  //   }
  //   const elementIndex = item.children.findIndex(
  //     (child) => child.id === element.id
  //   )
  //   item.children.splice(elementIndex, 1)
  // }

  // Open endpoints of connection
  const initializeOpenEndpoints = useRecoilCallback(
    ({ set, snapshot }) =>
      async (connectionName: string) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)
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

            set(ddpConnectionsState, (oldList: DdpConnection[]) => {
              return replaceItemAtIndex(oldList, connectionIndex, newConnection)
            })
          }
        }
      }
  )

  const addOpenEndpointToConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      async (connectionName: string) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)
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

          set(ddpConnectionsState, (oldTodoList: DdpConnection[]) => {
            return replaceItemAtIndex(
              oldTodoList,
              connectionIndex,
              newConnection
            )
          })
        }
      }
  )

  const removeOpenEndpointOfConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      async (connectionName: string, openEndpointId: string) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)
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

            set(ddpConnectionsState, (oldList: DdpConnection[]) => {
              return replaceItemAtIndex(oldList, connectionIndex, newConnection)
            })
          }
        }
      }
  )

  // const saveDescriptionOfOpenEndpoint = (
  //   state,
  //   { connectionName, openEndpointId, description }
  // ) => {
  //   const connection = state.ddpConnections.find(
  //     (ddpConnection) => ddpConnection.title === connectionName
  //   )
  //   connection.openEndpoints.find(
  //     (endpoint) => endpoint.id === openEndpointId
  //   ).description = description
  // }

  const saveNameOfOpenEndpoint = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
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
        const connections = await snapshot.getPromise(ddpConnectionsState)
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

            set(ddpConnectionsState, (oldList: DdpConnection[]) => {
              return replaceItemAtIndex(oldList, connectionIndex, oldConnection)
            })
          }
        }
      }
  )

  // const saveCollectionNameOfOpenEndpoint = (
  //   state,
  //   { connectionName, openEndpointId, collectionName }
  // ) => {
  //   const connection = state.ddpConnections.find(
  //     (ddpConnection) => ddpConnection.title === connectionName
  //   )
  //   const endpoint = connection.openEndpoints.find(
  //     (endpoint) => endpoint.id === openEndpointId
  //   )
  //   endpoint.collection = collectionName
  // }

  const saveArgOfOpenEndpoint = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
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
        const connections = await snapshot.getPromise(ddpConnectionsState)
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

            set(ddpConnectionsState, (oldList: DdpConnection[]) => {
              return replaceItemAtIndex(oldList, connectionIndex, oldConnection)
            })
          }
        }
      }
  )

  // const removeArgOfOpenEndpoint = (
  //   state,
  //   { connectionName, openEndpointId, argIndex }
  // ) => {
  //   const connection = state.ddpConnections.find(
  //     (ddpConnection) => ddpConnection.title === connectionName
  //   )
  //   const endpoint = connection.openEndpoints.find(
  //     (endpoint) => endpoint.id === openEndpointId
  //   )
  //   endpoint.args.splice(argIndex, 1)
  // }

  const removeArgOfOpenEndpoint = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        connectionName,
        openEndpointId,
        argIndex,
      }: {
        connectionName: string
        openEndpointId: string
        argIndex: number
      }) => {
        const connections = await snapshot.getPromise(ddpConnectionsState)
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

            set(ddpConnectionsState, (oldList: DdpConnection[]) => {
              return replaceItemAtIndex(oldList, connectionIndex, oldConnection)
            })
          }
        }
      }
  )

  // const saveOpenEndpointInCollection = (
  //   state,
  //   { connectionName, openEndpoint, indexesByFolder }
  // ) => {
  //   const connection = state.ddpConnections.find(
  //     (ddpConnection) => ddpConnection.title === connectionName
  //   )
  //   let folder = connection.collections[indexesByFolder.shift()]
  //   const collectionName = folder.name
  //   let folderIndexes = []
  //   for (let folderIndex of indexesByFolder) {
  //     folder = folder.children[folderIndex]
  //     folderIndexes.push(folderIndex)
  //   }
  //   const folderIndexesString = folderIndexes.toString().replaceAll(",", "")
  //   const endpointId = `${collectionName}-${
  //     indexesByFolder.length ? folderIndexesString + "-" : ""
  //   }${openEndpoint.name}`
  //   const endpoint = {
  //     ...openEndpoint,
  //     type: "endpoint",
  //     id: endpointId,
  //     title: openEndpoint.name,
  //   }
  //   const existsEndpoint = folder.children.find(
  //     (element) => element.id === endpoint.id
  //   )
  //   if (existsEndpoint) {
  //     const endpointIndex = folder.children.findIndex(
  //       (element) => element.id === endpoint.id
  //     )
  //     folder.children[endpointIndex] = endpoint
  //   } else {
  //     folder.children.push(endpoint)
  //     const openEndpointIndex = connection.openEndpoints.findIndex(
  //       (oe) => oe.id === openEndpoint.id
  //     )
  //     connection.openEndpoints[openEndpointIndex] = JSON.parse(
  //       JSON.stringify(endpoint)
  //     )
  //   }
  // }

  // const openEndpointFromCollection = (state, { connectionName, endpoint }) => {
  //   const connection = state.ddpConnections.find(
  //     (ddpConnection) => ddpConnection.title === connectionName
  //   )
  //   if (
  //     !connection.openEndpoints.find(
  //       (openEndpoint) => openEndpoint.id === endpoint.id
  //     )
  //   ) {
  //     connection.openEndpoints.push({ ...endpoint, title: endpoint.name })
  //   }
  // }

  return {
    initializeConnections,
    addConnection,
    removeConnection,
    addCollectionToConnection,
    removeCollectionOfConnection,
    initializeOpenEndpoints,
    addOpenEndpointToConnection,
    removeOpenEndpointOfConnection,
    saveArgOfOpenEndpoint,
    removeArgOfOpenEndpoint,
    saveNameOfOpenEndpoint,
  }
}

export type Dispatcher = ReturnType<typeof createDispatcher>
