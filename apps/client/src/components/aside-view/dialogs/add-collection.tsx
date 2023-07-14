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

import { toast } from "../../ui/use-toast"

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Collection name must be at least 2 characters.",
  }),
})

const AddCollectionDialog = ({
  open,
  toggle,
  connection,
  children,
}: PropsWithChildren<{
  open: boolean
  toggle: () => void
  connection: DdpConnection
}>) => {
  const { addCollectionToConnection } = useDdpConnectionStore.getState()

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(FormSchema),
  })

  const validateNewCollection = (data: z.infer<typeof FormSchema>) => {
    let isValid = true
    if (
      connection.collections.find((collection) => collection.name === data.name)
    ) {
      isValid = false
      toast({
        title: "Error",
        description: "This collection name is already in use",
        variant: "destructive",
      })
    }
    return isValid
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (validateNewCollection(data)) {
      // TODO: add descriptions
      addCollectionToConnection(connection.title, {
        id: data.name,
        name: data.name,
        type: "directory",
        children: [],
      })

      toggle()

      form.reset({ name: "" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Collection</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your new collection display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-2">
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCollectionDialog
