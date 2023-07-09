import { PropsWithChildren, useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection, Endpoint } from "@/store/types"
import { zodResolver } from "@hookform/resolvers/zod"
import MarkdownEditor from "@uiw/react-markdown-editor"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Tree, { TreeFileType } from "@/components/ui/tree"
import { DdpType } from "@/components/ddp-client/ddp-endpoint"

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Collection name must be at least 2 characters.",
  }),
  description: z.string(),
  path: z.string(),
})

const SaveEndpointDialog = ({
  children,
  connection,
  endpoint,
}: PropsWithChildren<{
  connection: DdpConnection | null
  endpoint: Endpoint
}>) => {
  const { saveOpenEndpointInCollection, saveNameOfOpenEndpoint } =
    useDdpConnectionStore.getState()

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
      description: "",
      path: "",
    },
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (connection) {
      const _endpoint: Endpoint = {
        ...endpoint,
        name: data.name,
        description: data.description,
      }
      const paths = data.path.split("/")
      const indexes: number[] = []
      let checkingIdx = 0
      const idx = connection.collections.findIndex(
        (_) => _.name === paths[checkingIdx] && _.type === "directory"
      )

      if (idx > -1) {
        indexes.push(idx)
        checkingIdx++

        const addIndex = (folder: TreeFileType) => {
          if (folder.type === "directory" && folder.children) {
            const idx = folder.children.findIndex(
              (_) => _.name === paths[checkingIdx]
            )
            if (idx > -1) {
              indexes.push(idx)
              checkingIdx++

              addIndex(folder.children[idx])
            }
          }
        }
        addIndex(connection.collections[idx])
      }

      saveOpenEndpointInCollection({
        connectionName: connection.title,
        openEndpoint: _endpoint,
        indexesByFolder: indexes,
      })
    }
  }

  // FIXME: duplicate function in ddp-endpoint.tsx
  function saveNameOfEndpoint(name: string, endpointType: DdpType) {
    saveNameOfOpenEndpoint({
      connectionName: connection?.title ?? "",
      openEndpointId: endpoint.id,
      name,
      endpointType,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className=""
      >
        <DialogHeader>
          <DialogTitle>
            Save endpoint to "{connection?.title ?? ""}"
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* TODO: Add field for publication */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      onBlur={() => saveNameOfEndpoint(field.name, "method")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <MarkdownEditor
                      className="min-h-[300px]"
                      value={field.value}
                      onChange={field.onChange}
                      toolbars={[
                        "bold",
                        "italic",
                        "header",
                        "strike",
                        "underline",
                        "quote",
                        "olist",
                        "ulist",
                        "todo",
                        "link",
                        "image",
                        "code",
                        "codeBlock",
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>
                    Save to{" "}
                    <span
                      className={cn(
                        "text-sm font-light text-muted-foreground",
                        field.value.length > 0 ? "text-md font-semibold" : null
                      )}
                    >
                      {field.value.length > 0
                        ? field.value
                        : "Select a collection/folder"}
                    </span>
                  </FormLabel>
                  <Tree
                    onFolderClick={(path) => field.onChange(path)}
                    value={connection?.collections}
                  />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SaveEndpointDialog
