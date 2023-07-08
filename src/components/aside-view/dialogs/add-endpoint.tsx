import { PropsWithChildren } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection } from "@/store/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TreeFileType } from "@/components/ui/tree"
import {
  DdpType,
  DdpTypeEnum,
  ddpTypeOptions,
} from "@/components/ddp-client/ddp-endpoint"

import { toast } from "../../ui/use-toast"

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Collection name must be at least 2 characters.",
  }),
  endpointType: z.enum(DdpTypeEnum),
  description: z.string(),
})

const AddEndpointDialog = ({
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
  const { addElementToCollection, addElementToFolder } =
    useDdpConnectionStore.getState()

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
      endpointType: "method",
      description: "",
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
    const endpoint: TreeFileType = {
      id: "",
      name: data.name,
      children: [],
      args: [],
      type: "endpoint",
      description: data.description,
      endpointType: data.endpointType,
    }
    if (validateElementName(endpoint.name, endpoint.type)) {
      addElement(endpoint)

      onOpenChange(false)
      form.reset({ name: "" })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add endpoint to "{element.name}" folder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endpointType"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as DdpType)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ddp type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ddpTypeOptions.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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

export default AddEndpointDialog
