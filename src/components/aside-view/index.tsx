import { useState } from "react"
import { DdpConnection } from "@/store/types"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icons } from "../icons"
import { Button } from "../ui/button"
import Tree from "../ui/tree"
import AddCollectionDialog from "./dialogs/add-collection"

const AsideView = ({ connection }: { connection: DdpConnection }) => {
  const [openAddCollectionDialog, setOpenAddCollectionDialog] = useState(false)

  // const searchTree = (element, elementId) => {
  //   // Code for searching tree
  //   if (element.id === elementId) {
  //     return element
  //   } else if (element.children != null) {
  //     let result = null
  //     for (let i = 0; result == null && i < element.children.length; i++) {
  //       result = searchTree(element.children[i], elementId)
  //     }
  //     return result
  //   }
  //   return null
  // }

  // const activeItem = (item) => {
  //   const itemSelected = item[0]
  //   if (itemSelected && itemSelected.type === "endpoint") {
  //     let endpointTemp = null
  //     for (const collection of connection.collections) {
  //       endpointTemp = searchTree(collection, itemSelected.id)
  //       if (endpointTemp) break
  //     }
  //     // Code for opening endpoint

  //     openEndpointFromCollection({
  //       connectionName: connection.title,
  //       endpoint: endpointTemp,
  //     })
  //     // $root.$emit('updateSelectedTab', { ...itemSelected });
  //   }
  // }

  return (
    <div className="px-4">
      <div className="flex">
        <div className="flex w-full items-center justify-between pt-2">
          <h3 className="font-semibold">Collections</h3>
          <div className="flex">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AddCollectionDialog
                    open={openAddCollectionDialog}
                    toggle={() => setOpenAddCollectionDialog((open) => !open)}
                    connection={connection}
                  >
                    <Button
                      size={"sm"}
                      variant="ghost"
                      className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                      <Icons.add className="h-5 w-5" />
                    </Button>
                  </AddCollectionDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add collection</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* <ImportCollections connection={connection}></ImportCollections> */}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Tree value={connection.collections} connection={connection} />
      </div>
    </div>
  )
}

export default AsideView
