'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PlusIcon, ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { stringify } from 'csv-stringify/sync'

interface Field {
  id: string
  name: string
  type: string
  required: boolean
  options: string | null
}

interface Value {
  id: string
  textValue: string | null
  numberValue: number | null
  dateValue: string | null
  boolValue: boolean | null
  fileValue: string | null
  locationValue: string | null
  fieldId: string
  field: Field
}

interface Entry {
  id: string
  createdAt: string
  updatedAt: string
  values: Value[]
}

interface Tracker {
  id: string
  name: string
  description: string | null
  fields: Field[]
}

export default function TrackerDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tracker, setTracker] = useState<Tracker | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCharts, setShowCharts] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTracker()
      fetchEntries()
    }
  }, [status, params.id])

  const fetchTracker = async () => {
    try {
      const response = await fetch(`/api/trackers/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch tracker')
      }
      
      const data = await response.json()
      setTracker(data)
    } catch (error) {
      console.error('Error fetching tracker:', error)
      setError('Failed to load tracker')
    } finally {
      setLoading(false)
    }
  }

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/trackers/${params.id}/entries`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch entries')
      }
      
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
      setError('Failed to load entries')
    }
  }

  const exportToCsv = () => {
    if (!tracker || entries.length === 0) return

    // Create header row with field names
    const headers = ['Entry ID', 'Created At', ...tracker.fields.map(field => field.name)]

    // Create data rows
    const rows = entries.map(entry => {
      const row: any[] = [entry.id, new Date(entry.createdAt).toLocaleString()]
      
      // Add values for each field
      tracker.fields.forEach(field => {
        const value = entry.values.find(v => v.fieldId === field.id)
        
        if (!value) {
          row.push('')
          return
        }
        
        switch (field.type) {
          case 'text':
            row.push(value.textValue || '')
            break
          case 'number':
            row.push(value.numberValue !== null ? value.numberValue : '')
            break
          case 'date':
            row.push(value.dateValue ? new Date(value.dateValue).toLocaleDateString() : '')
            break
          case 'toggle':
            row.push(value.boolValue ? 'Yes' : 'No')
            break
          case 'file':
            row.push(value.fileValue || '')
            break
          case 'location':
            row.push(value.locationValue || '')
            break
          default:
            row.push('')
        }
      })
      
      return row
    })

    // Generate CSV
    const csvContent = stringify([headers, ...rows])
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${tracker.name.replace(/\s+/g, '_')}_export.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">{error}</h2>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!tracker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tracker not found</h2>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tracker.name}</h1>
              {tracker.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tracker.description}</p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                href="/dashboard"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Entries</h2>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                {showCharts ? 'Hide Charts' : 'Show Charts'}
              </button>
              
              <button
                onClick={exportToCsv}
                disabled={entries.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
              
              <Link
                href={`/trackers/${params.id}/entries/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Entry
              </Link>
            </div>
          </div>

          {showCharts && (
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Charts</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Charts would be displayed here using Chart.js and react-chartjs-2.
                For numeric fields, we would show line or bar charts over time.
                For toggle fields, we would show pie charts of yes/no distribution.
              </p>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No entries yet.</p>
              <Link
                href={`/trackers/${params.id}/entries/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add your first entry
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      {tracker.fields.map((field) => (
                        <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {field.name}
                        </th>
                      ))}
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        {tracker.fields.map((field) => {
                          const value = entry.values.find(v => v.fieldId === field.id)
                          
                          if (!value) {
                            return (
                              <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                -
                              </td>
                            )
                          }
                          
                          let displayValue = '-'
                          
                          switch (field.type) {
                            case 'text':
                              displayValue = value.textValue || '-'
                              break
                            case 'number':
                              displayValue = value.numberValue !== null ? value.numberValue.toString() : '-'
                              break
                            case 'date':
                              displayValue = value.dateValue ? new Date(value.dateValue).toLocaleDateString() : '-'
                              break
                            case 'toggle':
                              displayValue = value.boolValue ? 'Yes' : 'No'
                              break
                            case 'file':
                              displayValue = value.fileValue ? 'File' : '-'
                              break
                            case 'location':
                              displayValue = value.locationValue ? 'Location' : '-'
                              break
                          }
                          
                          return (
                            <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {displayValue}
                            </td>
                          )
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/trackers/${params.id}/entries/${entry.id}`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

