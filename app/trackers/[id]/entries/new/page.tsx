'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Field {
  id: string
  name: string
  type: string
  required: boolean
  options: string | null
}

interface Tracker {
  id: string
  name: string
  description: string | null
  fields: Field[]
}

export default function NewEntry({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tracker, setTracker] = useState<Tracker | null>(null)
  const [values, setValues] = useState<{ fieldId: string; value: any }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTracker()
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
      
      // Initialize values array with empty values for each field
      setValues(data.fields.map((field: Field) => ({
        fieldId: field.id,
        value: getDefaultValueForType(field.type),
      })))
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tracker:', error)
      setError('Failed to load tracker')
      setLoading(false)
    }
  }

  const getDefaultValueForType = (type: string) => {
    switch (type) {
      case 'text':
        return ''
      case 'number':
        return ''
      case 'date':
        return new Date().toISOString().split('T')[0]
      case 'toggle':
        return false
      case 'file':
        return ''
      case 'location':
        return ''
      default:
        return ''
    }
  }

  const handleValueChange = (fieldId: string, value: any) => {
    setValues(values.map(v => 
      v.fieldId === fieldId ? { ...v, value } : v
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validate required fields
    const missingRequiredFields = tracker?.fields
      .filter(field => field.required)
      .filter(field => {
        const value = values.find(v => v.fieldId === field.id)?.value
        return value === '' || value === null || value === undefined
      })

    if (missingRequiredFields && missingRequiredFields.length > 0) {
      setError(`Please fill in all required fields: ${missingRequiredFields.map(f => f.name).join(', ')}`)
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/trackers/${params.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create entry')
      }

      router.push(`/trackers/${params.id}`)
    } catch (error: any) {
      console.error('Error creating entry:', error)
      setError(error.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error && !tracker) {
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              New Entry for {tracker.name}
            </h1>
            <Link
              href={`/trackers/${params.id}`}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Back to Tracker
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {tracker.fields.map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.id}
                        value={values.find(v => v.fieldId === field.id)?.value || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        required={field.required}
                      />
                    )}
                    
                    {field.type === 'number' && (
                      <input
                        type="number"
                        id={field.id}
                        value={values.find(v => v.fieldId === field.id)?.value || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        required={field.required}
                      />
                    )}
                    
                    {field.type === 'date' && (
                      <input
                        type="date"
                        id={field.id}
                        value={values.find(v => v.fieldId === field.id)?.value || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        required={field.required}
                      />
                    )}
                    
                    {field.type === 'toggle' && (
                      <div className="mt-1 flex items-center">
                        <input
                          type="checkbox"
                          id={field.id}
                          checked={values.find(v => v.fieldId === field.id)?.value || false}
                          onChange={(e) => handleValueChange(field.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={field.id} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Yes
                        </label>
                      </div>
                    )}
                    
                    {field.type === 'file' && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          File uploads would be implemented with cloud storage integration
                        </p>
                        <input
                          type="text"
                          id={field.id}
                          value={values.find(v => v.fieldId === field.id)?.value || ''}
                          onChange={(e) => handleValueChange(field.id, e.target.value)}
                          placeholder="Enter file URL for demo"
                          className="block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                          required={field.required}
                        />
                      </div>
                    )}
                    
                    {field.type === 'location' && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Location picker would be implemented with maps integration
                        </p>
                        <input
                          type="text"
                          id={field.id}
                          value={values.find(v => v.fieldId === field.id)?.value || ''}
                          onChange={(e) => handleValueChange(field.id, e.target.value)}
                          placeholder="Enter location for demo (e.g. 37.7749,-122.4194)"
                          className="block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                          required={field.required}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-5">
                  <div className="flex justify-end">
                    <Link
                      href={`/trackers/${params.id}`}
                      className="bg-white dark:bg-slate-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : 'Save Entry'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

