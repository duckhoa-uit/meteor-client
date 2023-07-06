import { FunctionComponent, HTMLProps, ReactNode } from "react"

export interface TabsProps
  extends Omit<HTMLProps<HTMLDivElement>, "className" | "onSelect" | "ref"> {
  className?: string | string[] | { [name: string]: boolean } | undefined
  defaultFocus?: boolean | undefined
  defaultIndex?: number | undefined
  direction?: "rtl" | "ltr" | undefined
  disabledTabClassName?: string | undefined
  disableUpDownKeys?: boolean | undefined
  disableLeftRightKeys?: boolean | undefined
  domRef?: ((node?: HTMLElement | null) => void) | null
  environment?: Window | undefined
  focusTabOnClick?: boolean | undefined
  forceRenderTabPanel?: boolean | undefined
  onSelect?:
    | ((index: number, last: number, event: Event) => boolean | void)
    | undefined
  selectedIndex?: number | undefined
  selectedTabClassName?: string | undefined
  selectedTabPanelClassName?: string | undefined
}

export type TabListProps = {
  className?: string | string[] | { [name: string]: boolean } | undefined
} & Omit<HTMLProps<HTMLUListElement>, "className">

export interface TabProps
  extends Omit<HTMLProps<HTMLLIElement>, "className" | "tabIndex"> {
  className?: string | string[] | { [name: string]: boolean } | undefined
  disabled?: boolean | undefined
  disabledClassName?: string | undefined
  selectedClassName?: string | undefined
  tabIndex?: number | undefined

  tabRef?: (node: ReactNode | HTMLElement | null) => void
}

export interface TabPanelProps
  extends Omit<HTMLProps<HTMLDivElement>, "className"> {
  className?: string | string[] | { [name: string]: boolean } | undefined
  forceRender?: boolean | undefined
  selectedClassName?: string | undefined
}

export interface UncontrolledTabsProps
  extends Omit<HTMLProps<HTMLDivElement>, "className" | "onSelect"> {
  className?: string | string[] | { [name: string]: boolean } | undefined
  direction?: "rtl" | "ltr"
  disabledTabClassName?: string
  disableUpDownKeys?: boolean
  disableLeftRightKeys?: boolean
  domRef?: TabsProps["domRef"]
  focus?: boolean
  forceRenderTabPanel?: boolean
  onSelect: (index: number, last: number, event: Event) => boolean | void
  selectedIndex: number
  selectedTabClassName?: string
  selectedTabPanelClassName?: string
  environment: any
}

export interface ReactTabsFunctionComponent<P = {}>
  extends FunctionComponent<P> {
  tabsRole: "Tabs" | "TabList" | "Tab" | "TabPanel"
}
