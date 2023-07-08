import { PropsWithChildren } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection } from "@/store/types"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TreeFileType } from "@/components/ui/tree"

const RemoveTreeItemDialog = ({
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
  const { removeElementFromCollection, removeCollectionOfConnection } =
    useDdpConnectionStore.getState()

  function getFolderNames() {
    const folderNames = currentPath.split("/")
    return folderNames
  }
  function onConfirm() {
    if (!connection) return

    if (parentLevel === 0) {
      const collectionIndex = connection.collections.findIndex(
        (collection) => collection.name === element.name
      )
      removeCollectionOfConnection({
        connectionName: connection.title,
        collectionIndex,
      })
    } else {
      const itemNames = getFolderNames()
      itemNames.pop()
      const collectionName = itemNames.shift()
      removeElementFromCollection({
        connectionName: connection.title,
        collectionName: collectionName ?? "",
        itemNames,
        element,
      })
    }
  }

  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            folder/endpoint.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RemoveTreeItemDialog
