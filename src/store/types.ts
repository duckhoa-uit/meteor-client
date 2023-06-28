export type StateProps = {
  ddpConnections: DdpConnection[]
  updateDdpConnections: (ddpConnections: DdpConnection[]) => void
  initializeConnections: () => void
  addConnection: () => void
  removeConnection: (connectionName: string) => void
  addCollectionToConnection: (
    connectionName: string,
    collection: DdpConnectionCollection
  ) => void
  removeCollectionOfConnection: (
    connectionName: string,
    collectionIndex: number
  ) => void
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
  title: string
  name?: string
  description: string | null
  args: EndpointArg[]
  endpointType?: endpointType
}

export type DdpConnectionCollection = {
  id: string
  name: string
}

export type DdpConnection = {
  title: string
  collections: DdpConnectionCollection[]
  openEndpoints: Endpoint[]
}
