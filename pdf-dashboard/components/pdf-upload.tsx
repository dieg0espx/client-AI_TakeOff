"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, AlertCircle, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { GoogleLoginButton } from "@/components/google-login-button"
import { CompanyJobsiteSelector } from "@/components/company-jobsite-selector"
import { ConsoleLogs } from "@/components/console-logs"
import axios from "axios"

interface PdfUploadProps {
  onFileUpload: (file: File, uploadResponse: { id: string; status: string; message: string }) => void
}

export function PdfUpload({ onFileUpload }: PdfUploadProps) {
  const { accessToken, setAccessToken, isAuthenticated } = useAuth()
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedJobsite, setSelectedJobsite] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file only")
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB")
      return false
    }
    setError(null)
    return true
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setFileUrl(URL.createObjectURL(file))
      }
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          setSelectedFile(file)
          setFileUrl(URL.createObjectURL(file))
        }
      }
      e.target.value = ""
    },
    [],
  )

  // Google Drive Upload Algorithm
  const uploadFileToDrive = async () => {
    if (!accessToken) {
      setError("Please log in first!")
      return
    }
    if (!selectedFile) {
      setError("Please select a file first!")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Step 1: Find or Create "AI-TakeOff" folder
      let folderId
      const folderSearchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='AI-TakeOff' and mimeType='application/vnd.google-apps.folder'&spaces=drive`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      const folderSearchResult = await folderSearchResponse.json()
      if (folderSearchResult.files.length > 0) {
        folderId = folderSearchResult.files[0].id
        console.log("📂 Found AI-TakeOff folder:", folderId)
      } else {
        // Folder doesn't exist, create it
        const folderCreateResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "AI-TakeOff",
            mimeType: "application/vnd.google-apps.folder",
          }),
        })

        const folderCreateResult = await folderCreateResponse.json()
        folderId = folderCreateResult.id
        console.log("📂 Created AI-TakeOff folder:", folderId)
      }

      // Step 2: Upload file to the AI-TakeOff folder
      const metadata = { name: selectedFile.name, mimeType: selectedFile.type, parents: [folderId] }
      const form = new FormData()
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }))
      form.append("file", selectedFile)

      const uploadResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      )

      const uploadResult = await uploadResponse.json()
      console.log("✅ File Uploaded:", uploadResult)

      // Step 3: Make file public
      await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      })

      console.log("✅ File uploaded successfully! Now calling the server...")

      // Step 4: Call the AI processing server
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'
      console.log(`🌐 Calling server at: ${apiUrl}/AI-Takeoff/${uploadResult.id}`)
      
      const serverResponse = await axios.get(
        `${apiUrl}/AI-Takeoff/${uploadResult.id}`,
        { headers: { "Content-Type": "application/json" } }
      )

      if (serverResponse.data.file_name !== '') {
        console.log('GOT SERVER RESPONSE')
        console.log(serverResponse.data)
        // Call the original onFileUpload callback with the processed result
        onFileUpload(selectedFile, {
          id: serverResponse.data.id || uploadResult.id,
          status: serverResponse.data.status || "uploaded",
          message: serverResponse.data.result || "File uploaded successfully for AI processing"
        })
      } else {
        setError(serverResponse.data.error || "Processing failed")
      }
    } catch (error) {
      console.error("❌ Upload Error:", error)
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleLogout = () => {
    setAccessToken(null)
    setSelectedFile(null)
    setFileUrl(null)
    setError(null)
  }

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company)
    console.log('Selected Company:', company)
  }

  const handleJobsiteSelect = (jobsite: string) => {
    setSelectedJobsite(jobsite)
    console.log('Selected Jobsite:', jobsite)
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-card/50">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Welcome to AI-TakeOff</h3>
              <p className="text-sm text-muted-foreground">
                Sign in with Google to upload and analyze your PDF documents with AI-powered insights.
              </p>
            </div>
            <GoogleLoginButton />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-card/50 transition-colors duration-200">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div
                key="upload-area"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col items-center justify-center space-y-4 py-8 transition-colors duration-200",
                  isDragOver && "bg-primary/5 border-primary/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  animate={{
                    scale: isDragOver ? 1.1 : 1,
                    rotate: isDragOver ? 5 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-full p-4 transition-colors duration-200",
                    isDragOver ? "bg-primary/10" : "bg-muted/50",
                  )}
                >
                  <Upload
                    className={cn(
                      "h-8 w-8 transition-colors duration-200",
                      isDragOver ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </motion.div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">{isDragOver ? "Drop your PDF here" : "Upload PDF Document"}</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop your PDF file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
                </div>

                <Button variant="outline" className="relative overflow-hidden bg-transparent" onClick={handleBrowseClick}>
                  Browse Files
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-destructive text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* File Preview */}
                {fileUrl && (
                  <div className="w-full h-96 overflow-auto rounded-lg border">
                    <embed 
                      src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      type="application/pdf" 
                      className="w-full h-full" 
                    />
                  </div>
                )}

                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleRemoveFile} variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Company and Jobsite Selector */}
                <CompanyJobsiteSelector 
                  onCompanySelect={handleCompanySelect}
                  onJobsiteSelect={handleJobsiteSelect}
                />

                {/* Console Logs */}
                <ConsoleLogs />

                {/* Upload Button */}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                  <Button onClick={uploadFileToDrive} disabled={uploading}>
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </div>
                    ) : (
                      "Upload & Process"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
