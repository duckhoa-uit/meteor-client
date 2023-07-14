import { useEffect, useRef, useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection, Endpoint, EndpointArg } from "@/store/types"
import { Allotment } from "allotment"

import SaveEndpointDialog from "../endpoint-view/dialogs/save-endpoint"
import { Icons } from "../icons"
import LoadingDots from "../loading-dots"
import { ServerConnectionRef } from "../server-connection"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import Arguments, { ArgumentsRef } from "./arguments"
import MethodResponse, { MethodResponseRef } from "./method-response"

// Extract the options enum from options
// https://stackoverflow.com/a/73825370
export const ddpTypeOptions = [
  { name: "Method", key: "method", disabled: false },
  { name: "Subscription", key: "publication", disabled: true },
] as const
export type DdpType = (typeof ddpTypeOptions)[number]["key"]
export const DdpTypeEnum: [DdpType, ...DdpType[]] = [
  ddpTypeOptions[0].key,
  ...ddpTypeOptions.slice(0).map((_) => _.key),
]

type DdpEndpointProps = {
  serverConnectionRef: ServerConnectionRef | null
  connection: DdpConnection
  endpoint: Endpoint
  isActive?: boolean
}
const DdpEndpoint = ({
  serverConnectionRef,
  connection,
  endpoint,
  isActive = false,
}: DdpEndpointProps) => {
  const { saveNameOfOpenEndpoint } = useDdpConnectionStore.getState()

  const responseRef = useRef<MethodResponseRef>(null)
  const argsRef = useRef<ArgumentsRef>(null)

  const [typeSelected, setTypeSelected] = useState("method")
  const [meteorMethod, setMeteorMethod] = useState<{
    name: string
    args: any[]
  }>({ name: "", args: [] })

  const [sendingRequest, setSendingRequest] = useState(false)

  // Subscription
  const [publication, setPublication] = useState<{
    name: string | null
    collectionName: string | null
  }>({
    name: null,
    collectionName: null,
  })
  const [isSubscriptionInProgress, setIsSubscriptionInProgress] = useState(null)

  // States for save
  const [editingDescription, setEditingDescription] = useState(false)
  const [description, setDescription] = useState<{ current: any }>({
    current: null,
  })

  useEffect(() => {
    setDescription({ current: endpoint.description })
    setTypeSelected(endpoint.endpointType || "method")
    if (endpoint.endpointType === "method") {
      setMeteorMethod({ name: endpoint.name ?? "", args: [] })
    } else {
      // TODO: support publish
      // setPublication({
      //   name: endpoint.name,
      //   collectionName: endpoint.collection,
      // })
    }
  }, [endpoint])

  const onOpenDocumentation = () => {
    // Handle opening documentation
  }

  const callMethod = async (args: any[]) => {
    // TODO: add time for performance
    // const initialTime = performance.now()

    if (!serverConnectionRef?.Meteor) return

    try {
      setSendingRequest(true)

      const methodResponseParsed = await serverConnectionRef.Meteor.call(
        meteorMethod.name,
        ...args
      )
      responseRef.current?.loadResponse(methodResponseParsed, 0)

      // TODO: add tracking time
      // responseRef.current?.loadResponse(methodResponseParsed, performance.now() - initialTime);
    } catch (exception) {
      console.error("meteor method error:", exception)
      responseRef.current?.loadResponse(exception, 0)

      // TODO: add tracking time
      // responseRef.current?.loadResponse(methodResponseParsed, performance.now() - initialTime);
    } finally {
      setSendingRequest(false)
    }
  }

  // TODO: add support pub/sub
  // const subscribeToPublication = async (args) => {
  //   // const initialTime = performance.now()
  //   let elapsedTime = 0
  //   try {
  //     if (isSubscriptionInProgress) {
  //       if (await isSubscriptionInProgress.isOn()) {
  //         await isSubscriptionInProgress.stop()
  //         connection.Meteor.stopChangeListeners()
  //       }
  //     }
  //     setIsSubscriptionInProgress(
  //       connection.Meteor.subscribe(publication.name, ...args)
  //     )
  //     // await isSubscriptionInProgress.start()
  //     // await isSubscriptionInProgress.ready()
  //     // elapsedTime = performance.now() - initialTime
  //     const firstResponse = connection.Meteor.collection(
  //       publication.collectionName
  //     ).reactive()
  //     // Update method response state
  //   } catch (exception) {
  //     console.error("subscription error: ", exception)
  //     // Update method response state
  //   }
  // }

  const loadArguments = (args: EndpointArg[]) => {
    let finalArgs = []
    for (let arg of args) {
      switch (arg.type.name) {
        case "object":
          finalArgs.push(arg.json)
          break
        case "array":
          finalArgs.push(arg.array)
          break
        case "string":
          finalArgs.push(arg.value)
          break
        case "boolean":
          finalArgs.push(!!arg.value)
          break
        case "number":
          finalArgs.push(arg.value)
          break
      }
    }
    return finalArgs
  }

  const ddp = () => {
    const args = loadArguments(argsRef.current?.args || [])
    if (typeSelected === "method") {
      callMethod(args)
    } else {
      // TODO: add support pub/sub
      // subscribeToPublication(args)
    }
  }

  // TODO: support documentation
  // const cancelDescription = () => {
  //   setDescription({ current: endpoint.description })
  //   setEditingDescription(false)
  // }

  // const saveDescription = () => {
  //   // Save description logic
  // }

  const saveNameOfEndpoint = (name: string, endpointType: DdpType) => {
    // Save name of endpoint logic
    saveNameOfOpenEndpoint({
      connectionName: connection.title,
      openEndpointId: endpoint.id,
      name,
      endpointType,
    })
  }

  const saveCollectionNameOfPublication = () => {
    // Save collection name of publication logic
  }

  const openSaveEndpoint = () => {
    // Open save endpoint logic
  }

  const validateEndpointToBeSaved = () => {
    // Validate endpoint to be saved logic
  }

  const saveEndpoint = () => {
    // Save endpoint logic
  }

  return (
    <div className={isActive ? "block" : "hidden"}>
      <div className="flex flex-col px-3">
        <div className="flex pl-3 pt-2">
          {/* TODO: add modal to read/write documentation */}
          {/* <a
            className="cursor-pointer font-medium hover:underline"
            onClick={onOpenDocumentation}
          >
            See doc
          </a> */}
        </div>
        <div className="flex flex-row">
          <Select onValueChange={setTypeSelected} value={typeSelected}>
            <SelectTrigger value={typeSelected} className="w-[200px]">
              <SelectValue placeholder="Port" />
            </SelectTrigger>
            <SelectContent>
              {ddpTypeOptions.map((item) => (
                <SelectItem
                  disabled={item.disabled}
                  key={item.key}
                  value={item.key}
                >
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {typeSelected === "method" ? (
            <>
              <Input
                value={meteorMethod.name ?? ""}
                placeholder="Enter method name"
                onChange={(e) =>
                  setMeteorMethod({ ...meteorMethod, name: e.target.value })
                }
                onBlur={() => saveNameOfEndpoint(meteorMethod.name, "method")}
              />
            </>
          ) : null}
          {typeSelected === "publication" ? (
            <>
              <Input
                value={publication.name ?? ""}
                placeholder="Enter publication name"
                onBlur={() =>
                  saveNameOfEndpoint(publication.name ?? "", "publication")
                }
              />
              <Input
                value={publication.collectionName ?? ""}
                placeholder="Enter collection name"
                onBlur={saveCollectionNameOfPublication}
              />
            </>
          ) : null}

          <Button
            disabled={sendingRequest}
            onClick={ddp}
            className="ml-2 flex items-center gap-2"
          >
            {sendingRequest ? (
              <LoadingDots style="big" />
            ) : (
              <Icons.send className="h-4 w-4" />
            )}
            {sendingRequest ? "Sending" : "Send"}
          </Button>

          <div>
            <SaveEndpointDialog endpoint={endpoint} connection={connection}>
              <Button variant={"outline"} className="ml-2">
                <Icons.post className="mr-2 h-4 w-4" />
                Save
              </Button>
            </SaveEndpointDialog>
          </div>
        </div>
      </div>

      <Allotment vertical className="h-[calc(100vh-216px)]">
        <Allotment.Pane preferredSize={"25%"}>
          <Arguments
            ref={argsRef}
            connection={connection}
            endpoint={endpoint}
          />
        </Allotment.Pane>
        <Allotment.Pane preferredSize={"75%"} snap>
          <MethodResponse ref={responseRef} />
        </Allotment.Pane>
      </Allotment>
    </div>
  )
}

export default DdpEndpoint
