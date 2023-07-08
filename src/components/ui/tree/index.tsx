import TreeFile from "./file"
import TreeFolder from "./folder"
import Tree from "./tree"

// import { TreeFile as TreeFileType } from "./types";

export type TreeComponentType = typeof Tree & {
  File: typeof TreeFile
  Folder: typeof TreeFolder
}
;(Tree as TreeComponentType).File = TreeFile
;(Tree as TreeComponentType).Folder = TreeFolder

export type { TreeProps } from "./tree"
export type { TreeFile as TreeFileType } from "./types"
export default Tree as TreeComponentType
