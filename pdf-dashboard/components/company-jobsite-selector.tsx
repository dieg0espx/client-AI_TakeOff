"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CompanyJobsiteSelectorProps {
  onCompanySelect: (company: string) => void
  onJobsiteSelect: (jobsite: string) => void
}

export function CompanyJobsiteSelector({ onCompanySelect, onJobsiteSelect }: CompanyJobsiteSelectorProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedJobsite, setSelectedJobsite] = useState<string>('')

  // Mock data - replace with actual data from your backend
  const companies = [
    { id: '1', name: 'TTF Scaffolding' },
    { id: '2', name: 'Construction Co A' },
    { id: '3', name: 'Building Corp B' }
  ]

  const jobsites = [
    { id: '1', name: 'Downtown Project', companyId: '1' },
    { id: '2', name: 'Highway Bridge', companyId: '1' },
    { id: '3', name: 'Office Complex', companyId: '2' },
    { id: '4', name: 'Residential Tower', companyId: '3' }
  ]

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId)
    setSelectedJobsite('') // Reset jobsite when company changes
    const company = companies.find(c => c.id === companyId)
    if (company) {
      onCompanySelect(company.name)
    }
  }

  const handleJobsiteChange = (jobsiteId: string) => {
    setSelectedJobsite(jobsiteId)
    const jobsite = jobsites.find(j => j.id === jobsiteId)
    if (jobsite) {
      onJobsiteSelect(jobsite.name)
    }
  }

  const filteredJobsites = jobsites.filter(j => j.companyId === selectedCompany)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Select value={selectedCompany} onValueChange={handleCompanyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobsite">Jobsite</Label>
          <Select value={selectedJobsite} onValueChange={handleJobsiteChange} disabled={!selectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Select a jobsite" />
            </SelectTrigger>
            <SelectContent>
              {filteredJobsites.map((jobsite) => (
                <SelectItem key={jobsite.id} value={jobsite.id}>
                  {jobsite.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
