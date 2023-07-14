import { PropsWithChildren } from "react";
import useDdpConnectionStore from "@/store";
import { DdpConnection } from "@/store/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"
import { shallow } from "zustand/shallow"

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TreeFileType } from "@/components/ui/tree"

import { toast } from "../../ui/use-toast"

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Collection name must be at least 2 characters.",
  }),
})

const AddFolderDialog = ({
  children,
  collectionName,
  connection,
  element,
  parentLevel,
  currentPath,
  onOpenChange,
}: PropsWithChildren<{
  parentLevel: number
  collectionName: string
  connection?: DdpConnection
  element: TreeFileType
  currentPath: string
  onOpenChange: (open: boolean) => void
}>) => {
  const { addElementToCollection, addElementToFolder } = useDdpConnectionStore(
    (state) => ({
      addElementToCollection: state.addElementToCollection,
      addElementToFolder: state.addElementToFolder,
    })
  )

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(FormSchema),
  })

  const validateElementName = (name: string, type: string) => {
    const elementExists = (element.children || []).find(
      (child) => child.name === name && child.type === type
    )
    if (!!elementExists) {
      toast({
        title: "Error",
        description: "Name already exists",
        variant: "destructive",
      })
    }
    return !elementExists
  }
  function getFolderNames() {
    const folderNames = currentPath.split("/")
    return folderNames
  }

  const addElement = (element: TreeFileType) => {
    if (!connection) return

    if (parentLevel === 0) {
      addElementToCollection({
        connectionName: connection.title,
        collectionName,
        element,
      })
    } else {
      const folderNames = getFolderNames()
      const collectionName = folderNames.shift()
      addElementToFolder({
        connectionName: connection.title,
        collectionName: collectionName ?? "",
        folderNames,
        element,
      })
    }
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const folder: TreeFileType = {
      id: "",
      name: data.name,
      type: "directory",
      children: [],
    }
    if (validateElementName(folder.name, folder.type)) {
      addElement(folder)

      onOpenChange(false)
      form.reset({ name: "" })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add folder to "{collectionName}" collection</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your new folder display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* TODO: support description markdown */}
            <DialogFooter className="mt-2">
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddFolderDialog