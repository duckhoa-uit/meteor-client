import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import useDebouncedCallback from "@/hooks/use-debounce/use-debounce-callback"
import useLocalStorage from "@/hooks/use-local-storage"

import { EditorBubbleMenu } from "./components"
import DEFAULT_EDITOR_CONTENT from "./default-content"
import { TiptapExtensions } from "./extensions"
import { TiptapEditorProps } from "./props"

export default function Editor() {
  const [content, setContent] = useLocalStorage(
    "content",
    DEFAULT_EDITOR_CONTENT
  )
  const [saveStatus, setSaveStatus] = useState("Saved")
  const [hydrated, setHydrated] = useState(false)

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const json = editor.getJSON()
    setSaveStatus("Saving...")
    setContent(json)
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus("Saved")
    }, 500)
  }, 750)

  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (e) => {
      setSaveStatus("Unsaved")

      // Autocomplete section

      // const selection = e.editor.state.selection
      // const lastTwo = getPrevText(e.editor, {
      //   chars: 2,
      // })
      // if (lastTwo === "++" && !isLoading) {
      //   e.editor.commands.deleteRange({
      //     from: selection.from - 2,
      //     to: selection.from,
      //   })
      //   complete(
      //     getPrevText(e.editor, {
      //       chars: 5000,
      //     })
      //   )
      //   // complete(e.editor.storage.markdown.getMarkdown());
      //   // TODO:support autocomplete tracking
      //   // va.track("Autocomplete Shortcut Used")
      // } else {
      //   debouncedUpdates(e)
      // }
      debouncedUpdates(e)
    },
    // autofocus: "end",
  })

  /**
   * START: support autocomplete section
   */

  // const { complete, completion, isLoading, stop } = useCompletion({
  //   id: "novel",
  //   api: "/api/generate",
  //   onFinish: (_prompt, completion) => {
  //     editor?.commands.setTextSelection({
  //       from: editor.state.selection.from - completion.length,
  //       to: editor.state.selection.from,
  //     })
  //   },
  //   onError: (err: any) => {
  //     toast({
  //       title: "Error",
  //       description: err.message,
  //     })
  //     if (err.message === "You have reached your request limit for the day.") {
  //       // TODO:support autocomplete tracking
  //       // va.track("Rate Limit Reached")
  //     }
  //   },
  // })

  // const prev = useRef("")

  // // Insert chunks of the generated text
  // useEffect(() => {
  //   const diff = completion.slice(prev.current.length)
  //   prev.current = completion
  //   editor?.commands.insertContent(diff)
  // }, [isLoading, editor, completion])

  // useEffect(() => {
  //   // if user presses escape or cmd + z and it's loading,
  //   // stop the request, delete the completion, and insert back the "++"
  //   const onKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
  //       stop()
  //       if (e.key === "Escape") {
  //         editor?.commands.deleteRange({
  //           from: editor.state.selection.from - completion.length,
  //           to: editor.state.selection.from,
  //         })
  //       }
  //       editor?.commands.insertContent("++")
  //     }
  //   }
  //   const mousedownHandler = (e: MouseEvent) => {
  //     e.preventDefault()
  //     e.stopPropagation()
  //     stop()
  //     if (window.confirm("AI writing paused. Continue?")) {
  //       complete(editor?.getText() || "")
  //     }
  //   }
  //   if (isLoading) {
  //     document.addEventListener("keydown", onKeyDown)
  //     window.addEventListener("mousedown", mousedownHandler)
  //   } else {
  //     document.removeEventListener("keydown", onKeyDown)
  //     window.removeEventListener("mousedown", mousedownHandler)
  //   }
  //   return () => {
  //     document.removeEventListener("keydown", onKeyDown)
  //     window.removeEventListener("mousedown", mousedownHandler)
  //   }
  // }, [stop, isLoading, editor, complete, completion.length])

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(content)
      setHydrated(true)
    }
  }, [editor, content, hydrated])

  //END: autocomplete section

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run()
      }}
      className="relative min-h-[300px] w-full max-w-screen-lg border-input bg-transparent p-4 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:rounded-lg sm:border"
    >
      <div className="absolute right-2 top-2 mb-5 rounded-lg border-input bg-stone-200 px-2 py-1 text-xs text-stone-400 dark:border dark:bg-transparent">
        {saveStatus}
      </div>
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
