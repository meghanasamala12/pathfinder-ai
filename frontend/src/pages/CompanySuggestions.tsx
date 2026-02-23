import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { API_BASE } from '../config'
import { Filter, Star, MapPin, Building2, DollarSign, ExternalLink, Bookmark, HelpCircle } from 'lucide-react'

interface RelatedJob {
  id: number; title: string; company: string | null; description: string | null
  required_skills: string | null; location: string | null; job_type: string | null
  industry: string | null; salary?: string | null; match_score?: number
}
interface CourseGrade { course: string; grade: string | null; credits: string | null }
interface SuitableRole { role: string; reason: string }
interface CourseworkAnalysis {
  summary: string; suitable_roles: SuitableRole[]; strengths: string[]
  suggested_roles: string[]; skills_to_highlight: string[]; recommendations: string[]
  areas_to_improve?: string[]
}

function parseLines(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

function CompanyLogo({ company }: { company: string | null }) {
  const initial = (company || '?').charAt(0).toUpperCase()
  const colors = ['bg-blue-500','bg-green-600','bg-purple-600','bg-amber-600','bg-red-500','bg-indigo-600','bg-teal-600']
  const idx = ((company || '').charCodeAt(0) || 0) % colors.length
  return (
    <div className={`w-12 h-12 rounded-lg ${colors[idx]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`} aria-hidden>
      {initial}
    </div>
  )
}

export default function CompanySuggestions() {
  const { user } = useAuth()
  const { profileVersion } = useProfile()
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([])
  const [loadingRelatedJobs, setLoadingRelatedJobs] = useState(false)
  const [industryFilter, setIndustryFilter] = useState('')
  const [minMatchScore, setMinMatchScore] = useState(0)
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set())
  const [importedCourseGrades, setImportedCourseGrades] = useState<CourseGrade[]>([])
  const [resumeText, setResumeText] = useState('')
  const [projectDocuments, setProjectDocuments] = useState<{ filename: string; text: string }[]>([])
  const [projectsExtra, setProjectsExtra] = useState('')
  const [courseworkPdfFile, setCourseworkPdfFile] = useState<File | null>(null)
  const [resumePdfFile, setResumePdfFile] = useState<File | null>(null)
  const [pastedCourseContent, setPastedCourseContent] = useState('')
  const [importingGrades, setImportingGrades] = useState(false)
  const [extractingResume, setExtractingResume] = useState(false)
  const [importingProjects, setImportingProjects] = useState(false)
  const [analyzingCoursework, setAnalyzingCoursework] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<CourseworkAnalysis | null>(null)
  const [jobAreaInterest, setJobAreaInterest] = useState('')
  const [showManualSection, setShowManualSection] = useState(false)
  const [error, setError] = useState('')
  const analyseSectionRef = useRef<HTMLDivElement>(null)

  const projectListForAnalysis = [
    ...projectDocuments.filter((d) => d.text.trim()).map((d) => `${d.filename}:\n${d.text.trim().slice(0, 8000)}`),
    ...parseLines(projectsExtra),
  ]
  const hasCourses = importedCourseGrades.length > 0
  const hasResume = resumeText.trim().length > 0
  const hasProjects = projectListForAnalysis.length > 0
  const canAnalyse = hasCourses || hasResume || hasProjects

  useEffect(() => {
    if (!user?.email) return
    setLoadingRelatedJobs(true)
    axios.get(`${API_BASE}/career/related-jobs`, { params: { email: user.email, limit: 20 } })
      .then(({ data }) => setRelatedJobs(data.jobs || []))
      .catch(() => setRelatedJobs([]))
      .finally(() => setLoadingRelatedJobs(false))
  }, [user?.email, profileVersion])

  const industries = Array.from(new Set(relatedJobs.map((j) => j.industry).filter(Boolean))) as string[]
  industries.sort()

  const filteredJobs = relatedJobs.filter((j) => {
    const industryOk = !industryFilter || j.industry === industryFilter
    const scoreOk = (j.match_score ?? 0) >= minMatchScore
    return industryOk && scoreOk
  })

  const toggleSave = (id: number) => {
    setSavedJobIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const handleImportCourseworkPdf = async (file?: File) => {
    const f = file ?? courseworkPdfFile
    if (!f) { setError('Please select a coursework/transcript PDF.'); return }
    setError(''); setImportingGrades(true); setAnalysisResult(null)
    try {
      const formData = new FormData(); formData.append('file', f)
      const { data } = await axios.post<{ course_grades: CourseGrade[] }>(`${API_BASE}/career/import-course-grades-pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const grades = Array.isArray(data.course_grades) ? data.course_grades : []
      setImportedCourseGrades(grades)
      if (grades.length === 0) setError('No courses could be parsed from the PDF.')
      setTimeout(() => analyseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } catch (err: unknown) {
      const d = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg).join(' ') : String(err))
    } finally { setImportingGrades(false) }
  }

  const handleImportCourseworkPaste = async () => {
    const text = pastedCourseContent.trim()
    if (!text) { setError('Paste your course grades first.'); return }
    setError(''); setImportingGrades(true); setAnalysisResult(null)
    try {
      const { data } = await axios.post<{ course_grades: CourseGrade[] }>(`${API_BASE}/career/import-course-grades`, { raw_text: text })
      const grades = Array.isArray(data.course_grades) ? data.course_grades : []
      setImportedCourseGrades(grades)
      if (grades.length === 0) setError('No courses could be parsed.')
      setTimeout(() => analyseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } catch (err: unknown) {
      const d = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg).join(' ') : String(err))
    } finally { setImportingGrades(false) }
  }

  const handleExtractResumePdf = async (file?: File) => {
    const f = file ?? resumePdfFile
    if (!f) { setError('Please select a resume PDF.'); return }
    setError(''); setExtractingResume(true)
    try {
      const formData = new FormData(); formData.append('file', f)
      const { data } = await axios.post<{ resume_text: string }>(`${API_BASE}/career/extract-resume-pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResumeText(data.resume_text ?? '')
      setTimeout(() => analyseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } catch (err: unknown) {
      const d = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg).join(' ') : String(err))
    } finally { setExtractingResume(false) }
  }

  const handleImportProjectFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setError(''); setImportingProjects(true)
    try {
      const formData = new FormData(); Array.from(fileList).forEach((file) => formData.append('files', file))
      const { data } = await axios.post<{ projects: { filename: string; text: string; error: string | null }[] }>(`${API_BASE}/career/import-project-files`, formData)
      const newItems = (data.projects || []).filter((p) => !p.error).map((p) => ({ filename: p.filename, text: p.text || '' }))
      setProjectDocuments((prev) => [...prev, ...newItems])
      const errs = (data.projects || []).filter((p) => p.error).map((p) => `${p.filename}: ${p.error}`)
      if (errs.length) setError(errs.join('; '))
      setTimeout(() => analyseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } catch (err: unknown) {
      const d = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg).join(' ') : String(err))
    } finally { setImportingProjects(false) }
  }

  const handleAnalyse = async () => {
    if (!canAnalyse) return
    setError(''); setAnalyzingCoursework(true); setAnalysisResult(null)
    try {
      const { data } = await axios.post<CourseworkAnalysis>(`${API_BASE}/career/analyze-coursework`, {
        course_grades: importedCourseGrades, resume_text: resumeText.trim() || undefined,
        projects: projectListForAnalysis.length > 0 ? projectListForAnalysis : undefined,
        job_area_interest: jobAreaInterest.trim() || undefined,
      })
      setAnalysisResult(data)
      setTimeout(() => document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } catch (err: unknown) {
      const d = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg).join(' ') : String(err))
    } finally { setAnalyzingCoursework(false) }
  }

  const skillsList = (s: string | null) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8 relative">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Matches</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Personalized opportunities based on your profile and interests</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
              <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}
                className="block w-48 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">All Industries</option>
                {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Match Score: {minMatchScore}%
              </label>
              <input type="range" min={0} max={100} value={minMatchScore} onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-600 accent-indigo-600" />
            </div>
          </div>
        </div>

        {/* Job opportunities */}
        <div className="mb-8">
          {loadingRelatedJobs ? (
            <p className="text-gray-500 dark:text-gray-400">Loading opportunities…</p>
          ) : user?.email ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Showing {filteredJobs.length} of {relatedJobs.length} opportunities
              </p>
              {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <CompanyLogo company={job.company} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{job.company || '—'}</p>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{job.title}</h3>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 flex-shrink-0">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{job.match_score ?? 0}%</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {job.industry && <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-gray-400" />{job.industry}</span>}
                            {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{job.location}</span>}
                            {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-400" />{job.salary}</span>}
                          </div>
                          {job.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{job.description}</p>}
                          {job.required_skills && skillsList(job.required_skills).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {skillsList(job.required_skills).slice(0, 6).map((skill) => (
                                <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent((job.title || '') + ' ' + (job.company || ''))}&location=United%20States`}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                              <ExternalLink className="w-4 h-4" /> View on LinkedIn
                            </a>
                            <button type="button" onClick={() => toggleSave(job.id)}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium ${
                                savedJobIds.has(job.id)
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}>
                              <Bookmark className={`w-4 h-4 ${savedJobIds.has(job.id) ? 'fill-current' : ''}`} /> Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No opportunities match your filters. Add your resume and career interests in the Dashboard, then click Update Profile.</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Sign in to see personalized career matches.</p>
            </div>
          )}
        </div>

        {/* Or analyze manually - collapsible */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button type="button" onClick={() => setShowManualSection(!showManualSection)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
            {showManualSection ? '−' : '+'} Or analyze manually
          </button>
        </div>

        {showManualSection && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 mb-4">
              Upload your coursework grades (PDF), resume (PDF), and add projects. Then click Analyse to see suitable job roles.
            </p>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">{error}</div>}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Add your data</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coursework grades (PDF)</h3>
                  <input type="file" accept=".pdf"
                    onChange={(e) => { const file = e.target.files?.[0] ?? null; setCourseworkPdfFile(file); setError(''); if (file) handleImportCourseworkPdf(file) }}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border file:border-gray-300 dark:file:border-gray-600 file:bg-gray-50 dark:file:bg-gray-700 dark:file:text-gray-300" />
                  <button type="button" onClick={() => handleImportCourseworkPdf()} disabled={importingGrades || !courseworkPdfFile}
                    className="mt-2 w-full px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                    {importingGrades ? 'Importing…' : 'Import PDF'}
                  </button>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">Or paste content</summary>
                    <textarea value={pastedCourseContent} onChange={(e) => setPastedCourseContent(e.target.value)} rows={2}
                      className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Paste transcript/grades…" />
                    <button type="button" onClick={handleImportCourseworkPaste} disabled={importingGrades || !pastedCourseContent.trim()}
                      className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Import from paste</button>
                  </details>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resume (PDF)</h3>
                  <input type="file" accept=".pdf"
                    onChange={(e) => { const file = e.target.files?.[0] ?? null; setResumePdfFile(file); setError(''); if (file) handleExtractResumePdf(file) }}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border file:border-gray-300 dark:file:border-gray-600 file:bg-gray-50 dark:file:bg-gray-700 dark:file:text-gray-300" />
                  <button type="button" onClick={() => handleExtractResumePdf()} disabled={extractingResume || !resumePdfFile}
                    className="mt-2 w-full px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                    {extractingResume ? 'Extracting…' : 'Extract from PDF'}
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Projects (PDF or PPTX)</h3>
                  <input type="file" accept=".pdf,.pptx" multiple
                    onChange={(e) => { const list = e.target.files; if (list && list.length) handleImportProjectFiles(list); e.target.value = '' }}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border file:border-gray-300 dark:file:border-gray-600 file:bg-gray-50 dark:file:bg-gray-700 dark:file:text-gray-300" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{importingProjects ? 'Importing…' : 'Select one or more PDF/PPTX files.'}</p>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">Or add a few lines</summary>
                    <textarea value={projectsExtra} onChange={(e) => setProjectsExtra(e.target.value)} rows={2}
                      className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g. Capstone: recommendation system" />
                  </details>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Courses you have done</h3>
                </div>
                <div className="p-4 min-h-[200px] max-h-[360px] overflow-auto">
                  {importingGrades ? (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Importing courses…</p>
                  ) : hasCourses ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="text-left text-gray-700 dark:text-gray-300 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-700/50">
                            <th className="py-2 px-2 font-semibold">Course</th>
                            <th className="py-2 px-2 font-semibold w-16">Credits</th>
                            <th className="py-2 px-2 font-semibold w-20">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importedCourseGrades.map((row, i) => (
                            <tr key={`${row.course}-${i}`} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                              <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{row.course}</td>
                              <td className="py-2 px-2 text-gray-800 dark:text-gray-300">{row.credits != null && String(row.credits).trim() !== '' ? String(row.credits) : '—'}</td>
                              <td className="py-2 px-2 text-gray-800 dark:text-gray-300">{row.grade != null && String(row.grade).trim() !== '' ? String(row.grade) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">Upload coursework PDF or paste content above.</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Resume</h3>
                </div>
                <div className="p-4 min-h-[200px] max-h-[360px] overflow-auto">
                  {extractingResume && <p className="text-sm text-indigo-600 dark:text-indigo-400">Extracting resume…</p>}
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} disabled={extractingResume}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-y min-h-[200px] disabled:opacity-70"
                    placeholder="Select resume PDF above or paste your resume text here…" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Projects</h3>
                  {projectDocuments.length > 0 && (
                    <button type="button" onClick={() => setProjectDocuments([])}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-400 rounded px-2 py-1">
                      Clear all ({projectDocuments.length})
                    </button>
                  )}
                </div>
                <div className="p-4 min-h-[200px] max-h-[360px] overflow-auto">
                  {importingProjects ? (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Importing project files…</p>
                  ) : projectDocuments.length > 0 || parseLines(projectsExtra).length > 0 ? (
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      {projectDocuments.filter((d) => d.filename).map((d, i) => (
                        <li key={`${d.filename}-${i}`} className="flex flex-col gap-0.5">
                          <span className="font-medium">{d.filename}</span>
                          {d.text ? <span className="text-gray-500 dark:text-gray-400 line-clamp-2">{d.text.slice(0, 120)}{d.text.length > 120 ? '…' : ''}</span>
                            : <span className="text-gray-400 italic">No text extracted</span>}
                        </li>
                      ))}
                      {parseLines(projectsExtra).map((line, i) => <li key={`extra-${i}`} className="list-disc list-inside">{line}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">Import PDF or PPTX project files above.</p>
                  )}
                </div>
              </div>
            </div>

            <div ref={analyseSectionRef} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. What job role area are you interested in?</h2>
              <input type="text" value={jobAreaInterest} onChange={(e) => setJobAreaInterest(e.target.value)}
                placeholder="e.g. Data Engineering, ML Engineer, Full Stack Developer"
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex justify-center mb-8">
              <button type="button" onClick={handleAnalyse} disabled={analyzingCoursework || !canAnalyse}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {analyzingCoursework ? 'Analysing…' : 'Analyse and get suitable job roles'}
              </button>
            </div>

            {analysisResult && (
              <div id="analysis-result" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Suitable roles for you</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{analysisResult.summary}</p>
                {analysisResult.suitable_roles && analysisResult.suitable_roles.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">Roles that fit your profile</h3>
                    <ul className="space-y-3">
                      {analysisResult.suitable_roles.map((s, i) => (
                        <li key={i} className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 dark:text-white">{s.role}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{s.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Strengths</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">{(analysisResult.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Suggested roles</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">{(analysisResult.suggested_roles || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Skills to highlight</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">{(analysisResult.skills_to_highlight || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Recommendations</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">{(analysisResult.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                  {analysisResult.areas_to_improve && analysisResult.areas_to_improve.length > 0 && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                      <h3 className="font-medium text-amber-900 dark:text-amber-300 mb-1">Areas to improve</h3>
                      <ul className="list-disc list-inside text-amber-900 dark:text-amber-400">
                        {analysisResult.areas_to_improve.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button type="button"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
        title="Help" aria-label="Help">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
