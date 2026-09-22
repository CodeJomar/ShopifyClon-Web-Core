"use client"

import * as React from "react"
import { useIsMobile } from "@/shared/hooks/use-mobile"

interface WorkspaceLayoutContextProps {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  isDrawerOpen: boolean
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  isMobile: boolean
}

const WorkspaceLayoutContext = React.createContext<WorkspaceLayoutContextProps | undefined>(undefined)

export function WorkspaceLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setIsDrawerOpen((prev) => !prev)
    } else {
      setIsCollapsed((prev) => !prev)
    }
  }, [isMobile])

  return (
    <WorkspaceLayoutContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleSidebar,
        isMobile: !!isMobile,
      }}
    >
      {children}
    </WorkspaceLayoutContext.Provider>
  )
}

export function useWorkspaceLayout() {
  const context = React.useContext(WorkspaceLayoutContext)
  if (!context) {
    throw new Error("useWorkspaceLayout debe usarse dentro de un WorkspaceLayoutProvider")
  }
  return context
}