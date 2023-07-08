import { Endpoint } from "@/store/types"

import { tuple } from "@/lib/types"

export const FileTreeValueType = tuple("directory", "endpoint")

export type TreeFile = {
  id: string
  extra?: string
  children?: Array<TreeFile>
  name: string
} & (
  | {
      type: (typeof FileTreeValueType)[0]
    }
  | (Endpoint & {
      type: (typeof FileTreeValueType)[1]
    })
)
