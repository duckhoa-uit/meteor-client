import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import useDdpConnectionStore from "@/store"
import {
  ArgumentType,
  DdpConnection,
  Endpoint,
  EndpointArg,
} from "@/store/types"
import isEqual from "lodash/isEqual"
import { v4 as uuidv4 } from "uuid"

import { replaceItemAtIndex } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Icons } from "../icons"
import ReactJSONEditor, { ReactJSONEditorRef } from "../json-editor"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Switch } from "../ui/switch"

type ArgumentsProps = {
  connection: DdpConnection
  endpoint: Endpoint
}

const argumentTypes: { name: ArgumentType; description: string }[] = [
  { name: "none", description: "Select one type" },
  { name: "object", description: "Object" },
  { name: "string", description: "String" },
  { name: "number", description: "Number" },
  { name: "boolean", description: "Boolean" },
  { name: "array", description: "Array" },
]

export type ArgumentsRef = {
  args: EndpointArg[]
}
const Arguments = forwardRef<ArgumentsRef, ArgumentsProps>(
  ({ connection, endpoint }, ref) => {
    const { removeArgOfOpenEndpoint, saveArgOfOpenEndpoint } =
      useDdpConnectionStore.getState()

    const editorJsonRef = useRef<ReactJSONEditorRef>(null)

    // TODO: support full-width view
    const [selectedArg, setSelectedArg] = useState<EndpointArg | null>(null)
    const [selectedArgIndex, setSelectedArgIndex] = useState<number | null>(
      null
    )

    const [args, setArgs] = useState<EndpointArg[]>([
      {
        array: [],
        json: {},
        value: null,
        type: { name: "none", description: "Select one type" },
        id: uuidv4(), // Generate a unique ID for each argument
      },
    ])

    useEffect(() => {
      const endpointArgs = JSON.parse(
        JSON.stringify(endpoint.args)
      ) as EndpointArg[]
      setArgs((prevArgs) => [...endpointArgs, ...prevArgs])
    }, [])

    useImperativeHandle(ref, () => {
      return {
        args,
      }
    })

    const onChange = (item: EndpointArg, index: number) => {
      const oldArgs = [...args]
      const newArgs = replaceItemAtIndex(oldArgs, index, item)

      const newLastArg: EndpointArg = {
        id: uuidv4(),
        type: {
          name: "none",
          description: "Select one type",
        },
        value: null,
      }
      setArgs([...newArgs, ...(args.length - 1 === index ? [newLastArg] : [])])
    }

    const expandJson = (index: number) => {
      setSelectedArgIndex(index)
      setSelectedArg(args[index])
      // Show the JSON editor modal
    }

    const removeGroup = (index: number) => {
      setArgs((prevArgs) => {
        const newArgs = [...prevArgs]
        newArgs.splice(index, 1)
        return newArgs
      })
      removeArgOfOpenEndpoint({
        connectionName: connection.title,
        openEndpointId: endpoint.id,
        argIndex: index,
      })
    }

    const autoSaveArg = (index: number) => {
      const arg = JSON.parse(JSON.stringify(args[index])) as EndpointArg
      saveArgOfOpenEndpoint({
        connectionName: connection.title,
        openEndpointId: endpoint.id,
        index,
        arg,
      })
    }

    const saveArgOfEndpoint = (index: number) => {
      const arg = JSON.parse(JSON.stringify(args[index])) as EndpointArg

      saveArgOfOpenEndpoint({
        connectionName: connection.title,
        openEndpointId: endpoint.id,
        index,
        arg,
      })
    }

    return (
      <div className="mb-1 mt-2 h-full w-full overflow-auto px-3">
        <p className="text-sm text-muted-foreground">Params</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Type</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {args.map((argument, index) => (
              <TableRow key={argument.id} className="group last:relative">
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      onChange(
                        {
                          ...argument,
                          type: {
                            ...argument.type,
                            name: value as ArgumentType,
                          },
                        },
                        index
                      )
                    }
                    value={argument.type.name}
                  >
                    <SelectTrigger className="min-w-[100px]">
                      <SelectValue placeholder="Port" />
                    </SelectTrigger>
                    <SelectContent>
                      {argumentTypes.map((item) => (
                        <SelectItem key={item.name} value={item.name}>
                          {item.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="relative">
                  {argument.type.name === "string" ||
                  argument.type.name === "none" ? (
                    <Input
                      value={argument.value ?? ""}
                      onChange={(e) =>
                        onChange({ ...argument, value: e.target.value }, index)
                      }
                      onBlur={() => saveArgOfEndpoint(index)}
                      placeholder={argument.value === null ? "Value" : ""}
                    />
                  ) : null}
                  {argument.type.name === "number" ? (
                    <Input
                      type="number"
                      value={argument.value ?? ""}
                      onChange={(e) =>
                        onChange({ ...argument, value: e.target.value }, index)
                      }
                      onBlur={() => saveArgOfEndpoint(index)}
                      placeholder={argument.value === null ? "Value" : ""}
                    />
                  ) : null}
                  {argument.type.name === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="boolean-value"
                        checked={Boolean(argument.value)}
                        onCheckedChange={(value) => {
                          onChange({ ...argument, value }, index)
                          saveArgOfEndpoint(index)
                        }}
                      />
                      <Label htmlFor="boolean-value">
                        {argument.value ? "true" : "false"}
                      </Label>
                    </div>
                  ) : null}
                  {argument.type.name === "array" ? (
                    <ReactJSONEditor
                      json={argument.array}
                      mode="code"
                      onChangeJSON={(json) => {
                        onChange({ ...argument, array: json }, index)
                      }}
                      onBlur={() => autoSaveArg(index)}
                      name="array-value"
                    />
                  ) : null}
                  {argument.type.name === "object" ? (
                    <ReactJSONEditor
                      ref={editorJsonRef}
                      json={argument.json}
                      mode="code"
                      onChange={() => {
                        const json = editorJsonRef.current?.getJSON()

                        if (json !== null && !isEqual(argument.json, json)) {
                          onChange(
                            {
                              ...argument,
                              json: json,
                            },
                            index
                          )
                        }
                      }}
                      // onChangeText={(jsonString) => {
                      //   const json = JSON.parse(jsonString)
                      //   console.log(
                      //     "🚀 ~ file: arguments.tsx:244 ~ json:",
                      //     json
                      //   )

                      //   if (json !== null && !isEqual(argument.json, json)) {
                      //     onChange(
                      //       {
                      //         ...argument,
                      //         json,
                      //       },
                      //       index
                      //     )
                      //   }
                      // }}
                      onBlur={() => autoSaveArg(index)}
                      name="object-value"
                    />
                  ) : null}
                  {(argument.type.name !== "none" ||
                    argument.value !== null) && (
                    <Button
                      variant={"link"}
                      className="absolute right-5 top-1/2 hidden -translate-y-1/2 text-muted-foreground group-hover:block group-hover:text-primary"
                      onClick={() => removeGroup(index)}
                    >
                      <Icons.close className="h-5 w-5 font-bold" />
                    </Button>
                  )}
                  {(argument.type.name === "object" ||
                    argument.type.name === "array") && (
                    <Button
                      variant={"link"}
                      className="absolute right-12 top-1/2 hidden -translate-y-1/2 group-hover:block"
                      onClick={() => expandJson(index)}
                    >
                      <Icons.expand className="h-5 w-5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* <ModalAccept fullscreen ref="jsonAccept">
        <div className="editor-fullwidth">
          {selectedArg && selectedArg.type.name === "object" && (
            <vue-json-editor
              v-model={selectedArg.json}
              show-btns={false}
              mode="code"
              onInput={() => autoSaveArg(selectedArgIndex)}
              expandedOnStart={true}
            />
          )}
          {selectedArg && selectedArg.type.name === "array" && (
            <vue-json-editor
              v-model={selectedArg.array}
              show-btns={false}
              mode="code"
              onInput={() => autoSaveArg(selectedArgIndex)}
              expandedOnStart={true}
            />
          )}
        </div>
      </ModalAccept> */}
      </div>
    )
  }
)

export default Arguments
