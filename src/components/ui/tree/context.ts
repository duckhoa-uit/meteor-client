import React from "react";
import { DdpConnection } from "@/store/types"

import { TreeFileType } from "./"

export interface TreeConfig {
  onFileClick?: (path: string, item: TreeFileType) => void
  initialExpand: boolean
  isImperative: boolean
  connection?: DdpConnection
}

const defaultContext = {
  initialExpand: false,
  isImperative: false,
}

export const TreeContext = React.createContext<TreeConfig>(defaultContext)

export const useTreeContext = (): TreeConfig =>
  React.useContext<TreeConfig>(TreeContext)