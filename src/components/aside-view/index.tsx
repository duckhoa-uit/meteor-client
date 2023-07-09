import { useState } from "react"
import useDdpConnectionStore from "@/store"
import { DdpConnection, Endpoint } from "@/store/types"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icons } from "../icons"
import { Button } from "../ui/button"
import Tree, { TreeFileType } from "../ui/tree"
import AddCollectionDialog from "./dialogs/add-collection"

const AsideView = ({
  connection,
  updateSelectedTab,
}: {
  connection: DdpConnection
  updateSelectedTab: (tab: Endpoint) => void
}) => {
  const { openEndpointFromCollection } = useDdpConnectionStore.getState()

  const [openAddCollectionDialog, setOpenAddCollectionDialog] = useState(false)

  const activeItem = (path: string, item: TreeFileType) => {
    const itemSelected = { ...item }
    if (itemSelected && itemSelected.type === "endpoint") {
      openEndpointFromCollection({
        connectionName: connection.title,
        endpoint: itemSelected,
      })

      // temporary setTimeout to fix update tab when the endpoint hasn't added to openEndpoints yet
      setTimeout(() => updateSelectedTab(itemSelected), 0)
    }
  }

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
        <Tree
          onClick={activeItem}
          value={connection.collections}
          connection={connection}
        />
      </div>
    </div>
  )
}

export default AsideView
