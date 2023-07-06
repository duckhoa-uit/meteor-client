import { useEffect, useState } from "react"

import { getTabsCount } from "../helpers/count"
import { ReactTabsFunctionComponent, TabsProps } from "../types"
import UncontrolledTabs from "./UncontrolledTabs"

const MODE_CONTROLLED = 0
const MODE_UNCONTROLLED = 1
const defaultProps = {
  defaultFocus: false,
  focusTabOnClick: true,
  forceRenderTabPanel: false,
  selectedIndex: null,
  defaultIndex: null,
  environment: null,
  disableUpDownKeys: false,
  disableLeftRightKeys: false,
}

const getModeFromProps = (props: { selectedIndex: number | null }) => {
  return props.selectedIndex === null ? MODE_UNCONTROLLED : MODE_CONTROLLED
}

const checkForIllegalModeChange = (props: any, mode: number) => {
  if (
    process.env.NODE_ENV !== "production" &&
    mode != undefined &&
    mode !== getModeFromProps(props)
  ) {
    throw new Error(
      `Switching between controlled mode (by using \`selectedIndex\`) and uncontrolled mode is not supported in \`Tabs\`.
For more information about controlled and uncontrolled mode of react-tabs see https://github.com/reactjs/react-tabs#controlled-vs-uncontrolled-mode.`
    )
  }
}

/**
 * State:
 *   mode: Initialized only once from props and never changes
 *   selectedIndex: null if controlled mode, otherwise initialized with prop defaultIndex, changed on selection of tabs, has effect to ensure it never gets out of bound
 *   focus: Because we never remove focus from the Tabs this state is only used to indicate that we should focus the current tab.
 *          It is initialized from the prop defaultFocus, and after the first render it is reset back to false. Later it can become true again when using keys to navigate the tabs.
 */
const Tabs: ReactTabsFunctionComponent<TabsProps> = (props) => {
  const {
    children,
    defaultFocus,
    defaultIndex,
    focusTabOnClick,
    onSelect,
    ...attributes
  } = {
    ...defaultProps,
    ...props,
  }

  const [focus, setFocus] = useState(defaultFocus)
  const [mode] = useState(getModeFromProps(attributes))
  const [selectedIndex, setSelectedIndex] = useState(
    mode === MODE_UNCONTROLLED ? defaultIndex || 0 : null
  )

  useEffect(() => {
    // Reset focus after initial render, see comment above
    setFocus(false)
  }, [])

  if (mode === MODE_UNCONTROLLED) {
    // Ensure that we handle removed tabs and don't let selectedIndex get out of bounds
    const tabsCount = getTabsCount(children)
    useEffect(() => {
      if (selectedIndex != null) {
        const maxTabIndex = Math.max(0, tabsCount - 1)
        setSelectedIndex(Math.min(selectedIndex, maxTabIndex))
      }
    }, [tabsCount])
  }

  checkForIllegalModeChange(attributes, mode)

  const handleSelected: (
    index: number,
    last: number,
    event: Event
  ) => boolean | void = (index, last, event) => {
    // Call change event handler
    if (typeof onSelect === "function") {
      // Check if the change event handler cancels the tab change
      if (onSelect(index, last, event) === false) return
    }

    // Always set focus on tabs unless it is disabled
    if (focusTabOnClick) {
      setFocus(true)
    }

    if (mode === MODE_UNCONTROLLED) {
      // Update selected index
      setSelectedIndex(index)
    }
  }

  let subProps: any = { ...props, ...attributes }

  subProps.focus = focus
  subProps.onSelect = handleSelected

  if (selectedIndex != null) {
    subProps.selectedIndex = selectedIndex
  }
  delete subProps.defaultFocus
  delete subProps.defaultIndex
  delete subProps.focusTabOnClick
  return <UncontrolledTabs {...subProps}>{children}</UncontrolledTabs>
}

Tabs.tabsRole = "Tabs"

export default Tabs
