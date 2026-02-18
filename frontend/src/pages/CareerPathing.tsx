import { Link } from 'react-router-dom'

export default function CareerPathing() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">← Home</Link>
        </div>
        <h1 className="text-3xl font-bold mb-8">Career Pathing</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/career/companies"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-indigo-500"
          >
            <h2 className="text-xl font-semibold mb-2 text-indigo-700">Suggest companies</h2>
            <p className="text-gray-600">
              Enter your coursework, projects, and interests. Get specific companies that match your profile.
            </p>
          </Link>
          <div className="bg-white rounded-lg shadow-lg p-6 opacity-75">
            <h2 className="text-xl font-semibold mb-2 text-gray-500">Skill demand & roadmap</h2>
            <p className="text-gray-600">Coming soon: skill demand analysis and personalized learning paths.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
