import React, { useEffect, useMemo, useRef, useState } from "react"
import { useCollapse } from "react-collapsed"

import { cn, setChildrenProps } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AddEndpointDialog from "@/components/aside-view/dialogs/add-endpoint"
import AddFolderDialog from "@/components/aside-view/dialogs/add-folder"
import RemoveTreeItemDialog from "@/components/aside-view/dialogs/remove-item"
import { Icons } from "@/components/icons"

import { Button } from "../button"
import { useTreeContext } from "./context"
import TreeFile from "./file"
import { makeChildPath, sortChildren, stopPropagation } from "./helpers"
import TreeIndents from "./indents"
import { TreeFile as TTreeFile } from "./types"

interface Props {
  item: TTreeFile
  parentPath?: string
  level?: number
  className?: string
}

const defaultProps = {
  level: 0,
  className: "",
  parentPath: "",
  name: "",
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeFolderProps = Props & NativeAttrs

const TreeFolder: React.FC<React.PropsWithChildren<TreeFolderProps>> = ({
  item,
  children,
  parentPath,
  level: parentLevel = 0,
  className,
  ...props
}: React.PropsWithChildren<TreeFolderProps>) => {
  const { name, extra } = item

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasOpenDialog, setHasOpenDialog] = useState(false)
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null)
  const focusRef = useRef<HTMLButtonElement | null>(null)
  function handleDialogItemSelect() {
    focusRef.current = dropdownTriggerRef.current
  }

  function handleDialogItemOpenChange(open: boolean) {
    setHasOpenDialog(open)
    if (open === false) {
      setDropdownOpen(false)
    }
  }

  const { initialExpand, isImperative, connection } = useTreeContext()
  const [isExpanded, setExpanded] = useState<boolean>(initialExpand)
  const { getToggleProps, getCollapseProps } = useCollapse({
    isExpanded,
  })

  useEffect(() => setExpanded(initialExpand), [])

  const currentPath = useMemo(() => makeChildPath(name, parentPath), [])
  const clickHandler = () => setExpanded(!isExpanded)

  const nextChildren = setChildrenProps(
    children,
    {
      parentPath: currentPath,
      level: parentLevel + 1,
    },
    [TreeFolder, TreeFile]
  )

  const sortedChildren = isImperative
    ? nextChildren
    : sortChildren(nextChildren, TreeFolder)

  return (
    <div
      className={cn("cursor-pointer select-none leading-none", className)}
      {...getToggleProps({
        onClick: clickHandler,
      })}
      {...props}
    >
      <div
        className={cn(
          "relative flex h-7 items-center",
          `ml-[${1.875 * parentLevel}rem]`
        )}
        style={{
          marginLeft: `calc(1.875rem * ${parentLevel})`,
        }}
      >
        <TreeIndents count={parentLevel} />
        <span className="absolute -left-5 top-1/2 z-10 inline-flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          {isExpanded ? <Icons.minusSquare /> : <Icons.plusSquare />}
        </span>
        <span className="mr-2 inline-flex h-full w-6 items-center justify-center">
          <Icons.folder />
        </span>
        <span className="whitespace-nowrap text-sm transition-opacity duration-100 hover:opacity-70">
          {name}
          {extra && <span className="self-baseline pl-1 text-xs">{extra}</span>}
        </span>

        <div className="ml-auto">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={(e) => e.stopPropagation()}
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                ref={dropdownTriggerRef}
              >
                <Icons.dotsHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              hidden={hasOpenDialog}
              onCloseAutoFocus={(event) => {
                if (focusRef.current) {
                  focusRef.current.focus()
                  focusRef.current = null
                  event.preventDefault()
                }
              }}
              align="end"
              className="w-[160px]"
            >
              <AddFolderDialog
                onOpenChange={handleDialogItemOpenChange}
                parentLevel={parentLevel}
                collectionName={name}
                connection={connection}
                element={item}
                currentPath={currentPath}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handleDialogItemSelect()
                  }}
                >
                  Add folder
                  <DropdownMenuShortcut>
                    <Icons.folderPlus className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </AddFolderDialog>

              <AddEndpointDialog
                onOpenChange={handleDialogItemOpenChange}
                parentLevel={parentLevel}
                collectionName={name}
                connection={connection}
                element={item}
                currentPath={currentPath}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handleDialogItemSelect()
                  }}
                >
                  Add endpoint
                  <DropdownMenuShortcut>
                    <Icons.filePlus className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </AddEndpointDialog>

              <DropdownMenuItem disabled>Export</DropdownMenuItem>

              <RemoveTreeItemDialog
                onOpenChange={handleDialogItemOpenChange}
                parentLevel={parentLevel}
                collectionName={name}
                connection={connection}
                element={item}
                currentPath={currentPath}
              >
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-500"
                  onSelect={(e) => {
                    e.preventDefault()
                    handleDialogItemSelect()
                  }}
                >
                  Delete
                  <DropdownMenuShortcut>
                    <Icons.delete className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </RemoveTreeItemDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        {...getCollapseProps()}
        className="flex h-auto flex-col"
        onClick={stopPropagation}
      >
        {sortedChildren}
      </div>
    </div>
  )
}

TreeFolder.defaultProps = defaultProps
TreeFolder.displayName = "GeistTreeFolder"
export default TreeFolder
