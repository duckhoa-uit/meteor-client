import React from "react"
import { DdpConnection } from "@/store/types"

export interface TreeConfig {
  onFileClick?: (path: string) => void
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
