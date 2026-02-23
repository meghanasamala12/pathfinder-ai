import { useState } from 'react'
import { useResumeUpload } from '../services/api/resume'

export default function ResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const { uploadResume, isLoading } = useResumeUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    try {
      const result = await uploadResume(file)
      console.log('Resume analysis:', result)
      alert('Resume uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload resume')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Resume Analysis</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Resume (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>
      </div>
    </div>
  )
}
