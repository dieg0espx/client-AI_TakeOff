"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <MainContent activeSection={activeSection} />
    </div>
  )
}
