import { TreeFileType } from "@/components/ui/tree"

import { FileTreeValueType, TreeFile } from "./../components/ui/tree/types"

export type StateProps = {
  ddpConnections: DdpConnection[]
  updateDdpConnections: (ddpConnections: DdpConnection[]) => void
  initializeConnections: () => void
  addConnection: () => void
  removeConnection: (connectionName: string) => void
  addCollectionToConnection: (
    connectionName: string,
    collection: Collection
  ) => void
  removeCollectionOfConnection: (
    args:{connectionName: string,
    collectionIndex: number}
  ) => void
  addElementToCollection: (args: {
    connectionName: string
    collectionName: string
    element: TreeFileType
  }) => void
  addElementToFolder: (args: {
    connectionName: string
    collectionName: string
    folderNames: string[]
    element: TreeFileType
  }) => void
  removeElementFromCollection: (args: {
    connectionName: string
    collectionName: string
    itemNames: string[]
    element: TreeFileType
  }) => void
  initializeOpenEndpoints: (connectionName: string) => void
  addOpenEndpointToConnection: (connectionName: string) => void
  removeOpenEndpointOfConnection: (
    connectionName: string,
    openEndpointId: string
  ) => void
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
  }) => void
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
  }) => void
  removeArgOfOpenEndpoint: ({
    connectionName,
    openEndpointId,
    argIndex,
  }: {
    connectionName: string
    openEndpointId: string
    argIndex: number
  }) => void
  openEndpointFromCollection: ({
    connectionName,
    endpoint,
  }: {
    connectionName: string
    endpoint: Endpoint
  }) => void
}

export type ArgumentType =
  | "none"
  | "object"
  | "string"
  | "number"
  | "boolean"
  | "array"

export type endpointType = "method" | "publication"

export type EndpointArg = {
  id: string
  array?: string[]
  json?: {}
  value?: any
  type: { name: ArgumentType; description: string }
}
export type Endpoint = {
  id: string
  title?: string
  name: string
  description: string | null
  args: EndpointArg[]
  endpointType?: endpointType
}

export type Collection = {
  id: string
  name: string
  description?: string
  children: Array<TreeFile>
} & TreeFile

export type DdpConnection = {
  title: string
  collections: Collection[]
  openEndpoints: Endpoint[]
}
