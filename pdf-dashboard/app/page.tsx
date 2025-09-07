"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [viewingTakeoff, setViewingTakeoff] = useState<{ fileName: string; result: any; company?: string; jobsite?: string } | null>(null)

  const handleViewTakeoff = (takeoffData: { fileName: string; result: any; company?: string; jobsite?: string }) => {
    setViewingTakeoff(takeoffData)
    setActiveSection("dashboard")
  }

  const handleCloseView = () => {
    setViewingTakeoff(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <MainContent 
        activeSection={activeSection} 
        viewingTakeoff={viewingTakeoff}
        onCloseView={handleCloseView}
        onViewTakeoff={handleViewTakeoff}
      />
    </div>
  )
}
