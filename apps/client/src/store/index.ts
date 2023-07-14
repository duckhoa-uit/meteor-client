import cloneDeep from "lodash/cloneDeep"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { removeItemAtIndex, replaceItemAtIndex } from "@/lib/utils"
import { TreeFileType } from "@/components/ui/tree"

import { Collection, DdpConnection, Endpoint, StateProps } from "./types"

const useDdpConnectionStore = create<StateProps>((set, get) => ({
  ddpConnections: [],
  updateDdpConnections: (ddpConnections) => {
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
          name: "",
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
          name: "",
          title: endpointName,
          description: null,
          args: [],
        },
      ],
    }

    set({ ddpConnections: [...connections, newConnection] })
  },
  removeConnection: (connectionName) => {
    const connections = get().ddpConnections

    if (connections.length > 0) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )

      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not delete item. Index out of bounds.")
      }

      set({ ddpConnections: removeItemAtIndex(connections, connectionIndex) })
    }
  },
  addCollectionToConnection: (connectionName, collection) => {
    const connections = get().ddpConnections

    if (connections.length > 0) {
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
  removeCollectionOfConnection: ({ connectionName, collectionIndex }) => {
    const connections = get().ddpConnections

    if (connections.length > 0) {
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
  addElementToCollection: ({ connectionName, collectionName, element }) => {
    const connections = get().ddpConnections

    if (connections.length > 0) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )

      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not add item. Index out of bounds.")
      }
      const connection = cloneDeep(connections[connectionIndex])

      const collectionIdx = (connection.collections || []).findIndex(
        (collection) => collection.name === collectionName
      )
      if (collectionIdx >= 0) {
        const oldCollection = connection.collections[collectionIdx]
        const collection: Collection = {
          ...oldCollection,
          children: [
            ...oldCollection.children,
            {
              ...element,
              id: `${collectionName}-${element.name}`,
            },
          ],
        }

        connection.collections = replaceItemAtIndex(
          connection.collections,
          collectionIdx,
          collection
        )

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            connection
          ),
        })
      }
    }
  },
  addElementToFolder: ({
    connectionName,
    collectionName,
    folderNames,
    element,
  }) => {
    const connections = get().ddpConnections

    if (connections.length > 0) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )
      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not add item. Index out of bounds.")
      }

      const connection = cloneDeep(connections[connectionIndex])

      let _folder: TreeFileType | undefined = connection.collections.find(
        (collection) => collection.name === collectionName
      )

      if (_folder) {
        const folderIndexes = []
        for (
          let folderLevel = 0;
          folderLevel < folderNames.length;
          folderLevel++
        ) {
          if (!_folder.children) break

          const folderIndex: number | undefined = _folder.children.findIndex(
            (child) =>
              child.type === "directory" &&
              child.name === folderNames[folderLevel]
          )
          if (folderIndex !== undefined) {
            folderIndexes.push(folderIndex)
            _folder = _folder.children[folderIndex]
          }
        }

        _folder.children = [
          ...(_folder.children || []),
          {
            ...element,
            id: `${collectionName}-${folderIndexes
              .toString()
              .replaceAll(",", "")}-${element.name}`,
          },
        ]

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            connection
          ),
        })
      }
    }
  },
  removeElementFromCollection: ({
    connectionName,
    collectionName,
    itemNames,
    element,
  }) => {
    const connections = get().ddpConnections

    if (connections.length > 0) {
      const connectionIndex = connections.findIndex(
        (ddpConnection) => ddpConnection.title === connectionName
      )
      if (connectionIndex < 0 || connectionIndex >= connections.length) {
        throw new Error("Could not add item. Index out of bounds.")
      }

      const connection = cloneDeep(connections[connectionIndex])

      let collection: TreeFileType | undefined = connection.collections.find(
        (collection) => collection.name === collectionName
      )

      if (collection) {
        for (let itemLevel = 0; itemLevel < itemNames.length; itemLevel++) {
          if (!collection) break
          collection = collection.children?.find(
            (child) =>
              child.type === "directory" && child.name === itemNames[itemLevel]
          )
        }

        const elementIndex = collection?.children?.findIndex(
          (child) => child.id === element.id
        )
        if (elementIndex !== undefined && collection) {
          collection.children?.splice(elementIndex, 1)
        }

        set({
          ddpConnections: replaceItemAtIndex(
            connections,
            connectionIndex,
            connection
          ),
        })
      }
    }
  },

  // ENDPOINTS
  initializeOpenEndpoints: (connectionName) => {
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
            name: "",
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
  addOpenEndpointToConnection: (connectionName) => {
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
        name: "",
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
  removeOpenEndpointOfConnection: (connectionName, openEndpointId) => {
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
  saveArgOfOpenEndpoint: ({ connectionName, openEndpointId, index, arg }) => {
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
  removeArgOfOpenEndpoint: ({ connectionName, openEndpointId, argIndex }) => {
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
  saveOpenEndpointInCollection: ({
    connectionName,
    openEndpoint,
    indexesByFolder,
  }) => {
    const connections = get().ddpConnections

    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const newConnection = cloneDeep(connections[connectionIndex])

      let folder: TreeFileType | undefined =
        newConnection.collections[indexesByFolder.shift() as number]
      const collectionName = folder.name
      let folderIndexes = []
      for (let folderIndex of indexesByFolder) {
        folder = folder?.children?.[folderIndex]
        folderIndexes.push(folderIndex)
      }

      if (folder && folder.children) {
        const folderIndexesString = folderIndexes.toString().replaceAll(",", "")
        const endpointId = `${collectionName}-${
          indexesByFolder.length ? folderIndexesString + "-" : ""
        }${openEndpoint.name}`

        const endpoint: TreeFileType = {
          ...openEndpoint,
          type: "endpoint",
          id: endpointId,
          title: openEndpoint.name,
        }

        const existsEndpoint = folder.children.find(
          (element) => element.id === endpoint.id
        )
        if (existsEndpoint) {
          const endpointIndex = folder.children.findIndex(
            (element) => element.id === endpoint.id
          )
          folder.children[endpointIndex] = endpoint
        } else {
          folder.children.push(endpoint)
          const openEndpointIndex = newConnection.openEndpoints.findIndex(
            (oe) => oe.id === openEndpoint.id
          )
          newConnection.openEndpoints[openEndpointIndex] = JSON.parse(
            JSON.stringify(endpoint)
          ) as Endpoint
        }

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
  // const saveOpenEndpointInCollection = (state, { connectionName, openEndpoint, indexesByFolder }) => {
  //   const connection = state.ddpConnections.find(ddpConnection => ddpConnection.title === connectionName);
  //   let folder = connection.collections[indexesByFolder.shift()];
  //   const collectionName = folder.name;
  //   let folderIndexes = [];
  //   for (let folderIndex of indexesByFolder) {
  //     folder = folder.children[folderIndex];
  //     folderIndexes.push(folderIndex);
  //   }
  //   const folderIndexesString = folderIndexes.toString().replaceAll(',', '');
  //   const endpointId = `${ collectionName }-${ indexesByFolder.length ? (folderIndexesString + '-') : '' }${ openEndpoint.name }`;
  //   const endpoint = {
  //     ...openEndpoint,
  //     type: 'endpoint',
  //     id: endpointId,
  //     title: openEndpoint.name
  //   };
  //   const existsEndpoint = folder.children.find(element => element.id === endpoint.id);
  //   if (existsEndpoint) {
  //     const endpointIndex = folder.children.findIndex(element => element.id === endpoint.id);
  //     folder.children[endpointIndex] = endpoint;
  //   } else {
  //     folder.children.push(endpoint);
  //     const openEndpointIndex = connection.openEndpoints.findIndex(oe => oe.id === openEndpoint.id);
  //     connection.openEndpoints[openEndpointIndex] = JSON.parse(JSON.stringify(endpoint));
  //   }
  // };

  openEndpointFromCollection: ({ connectionName, endpoint }) => {
    const connections = get().ddpConnections
    const connectionIndex = connections.findIndex(
      (ddpConnection) => ddpConnection.title === connectionName
    )

    if (connectionIndex >= 0) {
      const connection = connections[connectionIndex]
      if (
        !connection.openEndpoints.find(
          (openEndpoint) => openEndpoint.id === endpoint.id
        )
      ) {
        const newConnection = cloneDeep(connection)
        newConnection.openEndpoints.push({
          ...endpoint,
          title: endpoint.name ?? "New connection",
        })

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
}))

export default useDdpConnectionStore
