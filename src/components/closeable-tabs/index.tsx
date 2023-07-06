import { ReactNode, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";



import { closestItem, cn } from "@/lib/utils";



import { Icons } from "../icons";
import { Tab } from "./tab";


type CloseableTabsProps<T> = {
  tabKey: string
  tabs: T[]
  containerClassName?: string
  isTabSelected: (tab: T) => boolean
  getTabTitle: (tab: T) => string
  getTabContent: (tab: T, selected: boolean) => ReactNode
  onSelectTab: (tab: T) => void
  onRemoveTab: (tab: T) => void
  onAddTab: () => void
  onUpdateTabs: (tabs: T[]) => void
}

export default function CloseableTabs<T>({
  tabKey,
  tabs,
  containerClassName,
  isTabSelected,
  onSelectTab,
  onRemoveTab,
  onAddTab,
  onUpdateTabs,
  getTabTitle,
  getTabContent,
}: CloseableTabsProps<T>) {
  return (
    <div className={cn("flex w-full flex-col", containerClassName)}>
      <div className="grid h-12 grid-cols-[1fr_35px] rounded-t-md border-b-[1px] border-b-[#eeeeee] bg-[#fdfdfd] p-0 pt-1 dark:border-b-gray-700 dark:bg-transparent">
        <motion.ul
          className={cn(
            "m-0 flex list-none overflow-x-auto overflow-y-hidden p-0 text-sm font-medium"
          )}
          layoutScroll
        >
          <AnimatePresence initial={false}>
            {tabs.map((item) => (
              <Tab
                key={getTabTitle(item)}
                label={getTabTitle(item)}
                isSelected={isTabSelected(item)}
                onClick={() => onSelectTab(item)}
                onRemove={() => {
                  if (isTabSelected(item)) {
                    onSelectTab(closestItem(tabs, item))
                  }

                  onRemoveTab(item)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
        <motion.button
          className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center self-center rounded-full border-0 bg-[#eee] disabled:pointer-events-none disabled:cursor-default disabled:opacity-40 dark:bg-transparent dark:hover:bg-accent"
          onClick={onAddTab}
          whileTap={{ scale: 0.9 }}
        >
          <Icons.add className="h-5 w-5" />
        </motion.button>
      </div>
      <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {tabs.map(
          (tab) => getTabContent(tab, isTabSelected(tab))

          // <AnimatePresence
          //   mode="wait"
          //   key={tabKey ? `${tabKey}_${idx}` : "empty"}
          // >
          //   <motion.div
          //     animate={{ opacity: 1, y: 0 }}
          //     initial={{ opacity: 0, y: 15 }}
          //     // exit={{ opacity: 0, y: -15 }}
          //     transition={{ duration: 0.15 }}
          //   >
          //     {getTabContent(tab, isTabSelected(tab))}
          //   </motion.div>
          // </AnimatePresence>
        )}
      </div>
    </div>
  )
}