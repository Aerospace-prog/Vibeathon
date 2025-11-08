"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, X } from 'lucide-react'

interface AlertFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  severityMin: number
  severityMax: number
  symptomType: string
  dateFrom: string
  dateTo: string
}

export default function AlertFilters({ onFilterChange }: AlertFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    severityMin: 1,
    severityMax: 5,
    symptomType: '',
    dateFrom: '',
    dateTo: ''
  })

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      severityMin: 1,
      severityMax: 5,
      symptomType: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Severity</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={filters.severityMin}
                onChange={(e) => handleFilterChange('severityMin', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Severity</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={filters.severityMax}
                onChange={(e) => handleFilterChange('severityMax', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Symptom Type</label>
            <select
              value={filters.symptomType}
              onChange={(e) => handleFilterChange('symptomType', e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="">All Types</option>
              <option value="chest_pain">Chest Pain</option>
              <option value="breathing_difficulty">Breathing Difficulty</option>
              <option value="loss_of_consciousness">Loss of Consciousness</option>
              <option value="mental_health_crisis">Mental Health Crisis</option>
            </select>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
