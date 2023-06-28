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
