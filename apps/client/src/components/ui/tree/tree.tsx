import React, { ComponentProps, useMemo } from "react";
import { DdpConnection } from "@/store/types";



import { cn } from "@/lib/utils";



import { TreeConfig, TreeContext } from "./context";
import TreeFile, { TreeFileProps } from "./file";
import TreeFolder from "./folder";
import { sortChildren } from "./helpers";
import { FileTreeValueType, TreeFile as TTreeFile } from "./types";


const directoryType = FileTreeValueType[0]

interface Props {
  value?: Array<TTreeFile>
  initialExpand?: boolean
  onFileClick?: TreeConfig["onFileClick"]
  onFolderClick?: TreeConfig["onFileClick"]
  className?: string
  connection?: DdpConnection
}

const defaultProps = {
  initialExpand: false,
  className: "",
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeProps = Props & NativeAttrs

const makeChildren = (value: Array<TTreeFile> = []) => {
  if (!value || !value.length) return null
  return value
    .sort((a, b) => {
      if (a.type !== b.type) return a.type !== directoryType ? 1 : -1

      return `${a.name}`.charCodeAt(0) - `${b.name}`.charCodeAt(0)
    })
    .map((item, index) => {
      if (item.type === directoryType)
        return (
          <TreeFolder item={item} key={`folder-${item.name}-${index}`}>
            {makeChildren(item.children)}
          </TreeFolder>
        )
      return <TreeFile item={item} key={`file-${item.name}-${index}`} />
    })
}

const Tree: React.FC<React.PropsWithChildren<TreeProps>> = ({
  children,
  onFileClick,
  onFolderClick,
  initialExpand = false,
  value,
  className,
  connection,
  ...props
}: React.PropsWithChildren<TreeProps>) => {
  const isImperative = Boolean(value && value.length > 0)

  const initialValue: TreeConfig = useMemo(
    () => ({
      onFileClick,
      onFolderClick,
      initialExpand,
      isImperative,
      connection,
    }),
    [initialExpand]
  )

  const customChildren = isImperative
    ? makeChildren(value)
    : sortChildren(children, TreeFolder)

  return (
    <TreeContext.Provider value={initialValue}>
      <div className={cn("pl-[1.625rem]", className)} {...props}>
        {customChildren}
      </div>
    </TreeContext.Provider>
  )
}

Tree.defaultProps = defaultProps
Tree.displayName = "GeistTree"
export default Tree