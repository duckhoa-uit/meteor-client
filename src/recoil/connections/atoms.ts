import { atom } from "recoil"

import { Dispatcher } from "./dispatcher"
import { DdpConnection } from "./types"

export const ddpConnectionsState = atom<DdpConnection[]>({
  key: "ddpConnectionsState",
  default: [],
  effects: [
    ({ onSet }) => {
      onSet((newID) => {
        console.log("Current user ID:", newID)
      })
    },
  ],
})

export const dispatcherState = atom<Dispatcher | undefined>({
  key: "dispatcherState",
  default: undefined,
})
