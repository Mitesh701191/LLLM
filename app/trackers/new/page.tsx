'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Field {
  name: string
  type: string
  required: boolean
  options?: string
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'toggle', label: 'Toggle (Yes/No)' },
  { value: 'file', label: 'File Upload' },
  { value: 'location', label: 'Location' },
]

export default function NewTracker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<Field[]>([])
  const [currentField, setCurrentField] = useState<Field>({
    name: '',
    type: 'text',
    required: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  const addField = () => {
    if (!currentField.name.trim()) {
      setError('Field name is required')
      return
    }

    setFields([...fields, { ...currentField }])
    setCurrentField({
      name: '',
      type: 'text',
      required: false,
    })
    setError('')
  }

  const removeField = (index: number) => {
    const newFields = [...fields]
    newFields.splice(index, 1)
    setFields(newFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name.trim()) {
      setError('Tracker name is required')
      setLoading(false)
      return
    }

    if (fields.length === 0) {
      setError('At least one field is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/trackers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          fields,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Tracker</h1>
            <Link
              href="/dashboard"
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Back to Dashboard
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
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tracker Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                    placeholder="e.g., Workout Tracker, Expense Tracker"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                    placeholder="What will you track with this?"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fields</h3>
                  
                  {fields.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {fields.map((field, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded-md">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{field.name}</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              ({fieldTypes.find(t => t.value === field.type)?.label})
                              {field.required && ' - Required'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Field</h4>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Field Name
                        </label>
                        <input
                          type="text"
                          id="fieldName"
                          value={currentField.name}
                          onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                          placeholder="e.g., Weight, Amount, Date"
                        />
                      </div>

                      <div>
                        <label htmlFor="fieldType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Field Type
                        </label>
                        <select
                          id="fieldType"
                          value={currentField.type}
                          onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center">
                        <input
                          id="required"
                          type="checkbox"
                          checked={currentField.required}
                          onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="required" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Required field
                        </label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={addField}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Field
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <Link
                      href="/dashboard"
                      className="bg-white dark:bg-slate-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={loading || fields.length === 0}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Tracker'}
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

