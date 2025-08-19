import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Universal Tracker</h1>
        <p className="text-xl mb-8">
          Track anything with custom trackers. Create your own fields, add entries, and visualize your data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Create Custom Trackers</h2>
            <p className="mb-4">Design trackers for anything you want to monitor - habits, expenses, workouts, and more.</p>
            <ul className="list-disc list-inside text-left mb-4">
              <li>Define custom fields (text, number, date, toggle, etc.)</li>
              <li>Organize your data your way</li>
              <li>Track multiple categories in one place</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Visualize Your Progress</h2>
            <p className="mb-4">See your data come to life with charts and analytics.</p>
            <ul className="list-disc list-inside text-left mb-4">
              <li>Track trends over time</li>
              <li>Filter and sort your entries</li>
              <li>Export data to CSV for advanced analysis</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auth/login" 
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/auth/register" 
            className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg border border-gray-300 dark:border-slate-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}

