import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import MeteormanLogo from "@/assets/images/meteor-man.webp"
import JSONEditor from "jsoneditor"

import { cn } from "@/lib/utils"

import ReactJSONEditor from "../json-editor"

interface MethodResponseProps {}

export type MethodResponseRef = {
  loadResponse: (response: any, elapsedTime: number) => void
}
const MethodResponse = forwardRef<MethodResponseRef, MethodResponseProps>(
  (props, ref) => {
    const [response, setResponse] = useState<any>("")
    const [elapsedTime, setElapsedTime] = useState<string | null>(null)

    const formattedElapsedTime = (elapsedTime: number) => {
      if (elapsedTime < 1000) {
        return `${elapsedTime.toFixed(2)} ms`
      } else if (elapsedTime < 60000) {
        return `${(elapsedTime / 1000).toFixed(2)} s`
      } else {
        return `${(elapsedTime / (1000 * 60000)).toFixed(2)} m`
      }
    }

    useImperativeHandle(ref, () => {
      return {
        loadResponse: (response: any, elapsedTime: number) => {
          setElapsedTime(formattedElapsedTime(elapsedTime))

          if (response === undefined) {
            setResponse(" ")
          } else if (typeof response === "boolean") {
            setResponse(response.toString())
          } else {
            setResponse(response)
          }
        },
      }
    })

    return (
      <div className="relative h-full w-full overflow-auto px-3">
        <div className="absolute left-0 top-[1px] z-10 flex w-full justify-between px-3 ">
          <p className="text-sm leading-7 text-muted-foreground [&:not(:first-child)]:mt-6">
            Response
          </p>
          {elapsedTime && (
            <p className="text-sm leading-7 text-muted-foreground">
              Time: <span className="text-green-600">{elapsedTime}</span>
            </p>
          )}
        </div>
        <div className={cn(response ? "mt-7 block" : "hidden")}>
          <ReactJSONEditor
            onEditable={(node) => {
              if (!("path" in node)) {
                return false
              }
              return true
            }}
            className="h-[500px]"
            json={response}
            mode="code"
            name="method-response"
          />
        </div>
        <div
          className={cn(
            "h-full flex-col items-center justify-center",
            response ? "hidden" : "flex"
          )}
        >
          <img
            width="200"
            src={MeteormanLogo}
            alt="Meteorman"
            className="logo"
          />
          <label className="text-sm text-muted-foreground">
            Hit send to get a response
          </label>
        </div>
      </div>
    )
  }
)

export default MethodResponse