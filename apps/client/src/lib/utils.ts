import React, { ReactNode } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export const replaceItemAtIndex = <T>(
  arr: T[],
  index: number,
  newValue: T
): T[] => {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

export const removeItemAtIndex = <T>(arr: T[], index: number): T[] => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

export function removeItem<T>([...arr]: T[], item: T) {
  const index = arr.indexOf(item)
  index > -1 && arr.splice(index, 1)
  return arr
}

export function closestItem<T>(arr: T[], item: T) {
  const index = arr.indexOf(item)
  if (index === -1) {
    return arr[0]
  } else if (index === arr.length - 1) {
    return arr[arr.length - 2]
  } else {
    return arr[index + 1]
  }
}

export const setChildrenProps = (
  children: ReactNode | undefined,
  props: Record<string, unknown>,
  targetComponents: Array<React.ElementType> = []
): ReactNode | undefined => {
  if (React.Children.count(children) === 0) return []
  const allowAll = targetComponents.length === 0
  const clone = (child: React.ReactElement, props = {}) =>
    React.cloneElement(child, props)

  return React.Children.map(children, (item) => {
    if (!React.isValidElement(item)) return item
    if (allowAll) return clone(item, props)

    const isAllowed = targetComponents.find((child) => child === item.type)
    if (isAllowed) return clone(item, props)
    return item
  })
}
