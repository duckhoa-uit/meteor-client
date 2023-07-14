import "jsoneditor/dist/jsoneditor.min.css"
import "./styles.css"

import React, { useEffect, useImperativeHandle, useRef } from "react"
import JSONEditor, { JSONEditorMode, JSONEditorOptions } from "jsoneditor"

import { cn } from "@/lib/utils"

type ReactJSONEditorProps = {
  json?: any
  text?: any
  name: string
  mode?: string
  modes?: string[]
  className?: string
  onChange?: (value: any) => void
} & Omit<JSONEditorOptions, "onChange">

export type ReactJSONEditorRef = {
  getJSON: () => any
}

const ReactJSONEditor: React.ForwardRefRenderFunction<
  ReactJSONEditorRef,
  ReactJSONEditorProps
> = (props, ref) => {
  const editorElementRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<JSONEditor | null>(null)

  useEffect(() => {
    createEditor()
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    if (props.json) {
      editorRef.current.update(props.json)
    } else if (props.text) {
      editorRef.current.updateText(props.text)
    }
  }, [props.json, props.text])

  const createEditor = () => {
    editorRef.current = null
    let mode: JSONEditorMode = "form"
    let name = "JSON editor"
    if (props.mode) {
      mode = props.mode
    }
    if (props.name) {
      name = props.name
    }

    let modes: JSONEditorMode[] = ["form", "tree", "code", "view"]
    if (props.modes && props.modes.length > 0) {
      modes = props.modes
    }

    const editorOptions: JSONEditorOptions = {
      mainMenuBar: false,
      mode,
      modes,
      name,
      search: false,
      onChange: handleChange,
      onChangeJSON: props.onChangeJSON,
      onChangeText: props.onChangeText,
    }

    if (editorElementRef.current) {
      editorRef.current = new JSONEditor(
        editorElementRef.current,
        editorOptions
      )

      if (props.json) {
        editorRef.current.set(props.json)
      } else if (props.text) {
        editorRef.current.setText(props.text)
      }
    }
  }

  const handleChange = () => {
    if (props.onChange && editorRef.current) {
      try {
        const text = editorRef.current.getText()
        if (text === "") {
          props.onChange(null)
        }

        const currentJson = editorRef.current.get()
        if (props.json !== currentJson) {
          props.onChange(currentJson)
        }
      } catch (err) {
        console.log("🚀 ~ file: index.tsx:107 ~ handleChange ~ err:", err)
      }
    }
  }

  const getJSON = () => {
    try {
      return editorRef.current ? editorRef.current.get() : undefined
    } catch (e) {
      return null
    }
  }

  useImperativeHandle(ref, () => ({
    getJSON: () => getJSON(),
  }))

  return (
    <div
      className={cn("ReactJSONEditor", props.className)}
      ref={editorElementRef}
    />
  )
}

export default React.forwardRef(ReactJSONEditor)
