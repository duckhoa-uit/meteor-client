import React, { useMemo, useRef, useState } from "react"
import FileIcon from "@/assets/images/meteor-file.webp"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import RemoveTreeItemDialog from "@/components/aside-view/dialogs/remove-item"
import { Icons } from "@/components/icons"

import { Button } from "../button"
import { useTreeContext } from "./context"
import { makeChildPath, stopPropagation } from "./helpers"
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
export type TreeFileProps = Props & NativeAttrs

const TreeFile: React.FC<React.PropsWithChildren<TreeFileProps>> = ({
  item,
  parentPath,
  level = 0,
  className,
  ...props
}: React.PropsWithChildren<TreeFileProps>) => {
  const { name, extra } = item
  const { connection } = useTreeContext()

  const { onFileClick } = useTreeContext()
  const currentPath = useMemo(() => makeChildPath(name, parentPath), [])
  const clickHandler = (event: React.MouseEvent) => {
    stopPropagation(event)
    onFileClick && onFileClick(currentPath, item)
  }

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

  return (
    <div
      className={cn(
        "cursor-pointer select-none leading-none",
        `ml-[${1.875 * level}rem]`,
        className
      )}
      style={{
        marginLeft: `calc(1.875rem * ${level})`,
      }}
      onClick={clickHandler}
      {...props}
    >
      <div className="relative flex h-7 items-center">
        <TreeIndents count={level} />
        <span className="mr-2 inline-flex h-full w-5 items-center">
          {/* <img src={FileIcon} className="h-5 w-5" /> */}
          <Icons.file className="h-5 w-5" />
        </span>
        <span className="whitespace-nowrap text-sm transition-opacity duration-100 hover:opacity-70">
          {name}
          {extra && <span className="self-baseline pl-1 text-xs">{extra}</span>}
        </span>

        {connection && (
          <div className="ml-auto">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
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
                <RemoveTreeItemDialog
                  onOpenChange={handleDialogItemOpenChange}
                  parentLevel={level}
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
        )}
      </div>
    </div>
  )
}

TreeFile.defaultProps = defaultProps
TreeFile.displayName = "GeistTreeFile"
export default TreeFile
