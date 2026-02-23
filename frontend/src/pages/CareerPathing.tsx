import { Link } from 'react-router-dom'

export default function CareerPathing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">← Home</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Career Pathing</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/career/companies"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow border-l-4 border-indigo-500"
          >
            <h2 className="text-xl font-semibold mb-2 text-indigo-700 dark:text-indigo-400">Suggest companies</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your coursework, projects, and interests. Get specific companies that match your profile.
            </p>
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 opacity-75">
            <h2 className="text-xl font-semibold mb-2 text-gray-500 dark:text-gray-400">Skill demand & roadmap</h2>
            <p className="text-gray-600 dark:text-gray-400">Coming soon: skill demand analysis and personalized learning paths.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
