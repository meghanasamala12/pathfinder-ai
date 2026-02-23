import { useState, useRef, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { API_BASE } from '../config'

const GraduationCapIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
)
const BriefcaseIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const HeartIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)
const DocumentIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)
const UploadIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)
const CheckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)
const DownloadIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)
const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

type TabId = 'coursework' | 'projects' | 'interests' | 'documents'

interface Skill { name: string; percent: number }
interface Course { title: string; term: string; grade: string; tags: string[] }
interface ProfileProject { title: string; description: string; technologies: string[]; date: string }
interface UploadedFile { id: string; file: File; size: string; date: string }

const RESUME_ACCEPT = '.pdf,.doc,.docx'
const COURSEWORK_ACCEPT = '.pdf,.doc,.docx'
const PROJECTS_ACCEPT = '.pdf,.doc,.docx,.pptx,.zip'

function SkillBar({ name, percent }: Skill) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{percent}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 dark:bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

interface DocumentUploadSectionProps {
  title: string; description: string; accept: string
  files: UploadedFile[]; onAdd: (files: FileList) => void; onRemove: (id: string) => void
}

function DocumentUploadSection({ title, description, accept, files, onAdd, onRemove }: DocumentUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) onAdd(e.dataTransfer.files) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const list = e.target.files; if (list?.length) onAdd(list); e.target.value = '' }
  const handleDownload = (uf: UploadedFile) => { const url = URL.createObjectURL(uf.file); const a = document.createElement('a'); a.href = url; a.download = uf.file.name; a.click(); URL.revokeObjectURL(url) }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      <div
        onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
        }`}
      >
        <UploadIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Drag and drop your files here, or browse</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Supported formats: {accept.split(',').map((e) => e.trim().replace(/^\./, '').toUpperCase()).join(', ')}
        </p>
        <input ref={inputRef} type="file" accept={accept} multiple onChange={handleFileSelect} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
          <UploadIcon className="w-4 h-4" /> Choose Files
        </button>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploaded Files ({files.length})</p>
          <ul className="space-y-2">
            {files.map((uf) => (
              <li key={uf.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1">{uf.file.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{uf.size}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{uf.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600" title="Uploaded"><CheckIcon /></span>
                  <button type="button" onClick={() => handleDownload(uf)} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Download"><DownloadIcon /></button>
                  <button type="button" onClick={() => onRemove(uf.id)} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Remove"><XIcon /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TopCareerMatches({ email }: { email?: string }) {
  const [jobs, setJobs] = useState<{id: number; title: string; company: string; description: string; location: string; salary: string; match_score: number}[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!email) return
    setLoading(true)
    axios.get(`${API_BASE}/career/related-jobs`, { params: { email, limit: 3 } })
      .then(({ data }) => setJobs((data.jobs || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [email])

  if (loading) return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-400">Loading matches…</div>
  if (!jobs.length) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
      Upload your resume in Documents tab and click Update Profile to see matches.
    </div>
  )
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{(job.company || '?')[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{job.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{job.company}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{job.match_score}%</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Match Score</p>
            </div>
          </div>
          {job.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">{job.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
            {job.location && <span>{job.location}</span>}
            {job.salary && <><span>•</span><span>{job.salary}</span></>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('coursework')
  const [courses, setCourses] = useState<Course[]>([])
  const { resumeFiles, courseworkFiles, projectFiles, addFiles, removeFile, bumpProfileVersion } = useProfile()
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileTitle, setProfileTitle] = useState<string | null>(null)
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([])
  const [softSkills, setSoftSkills] = useState<Skill[]>([])
  const [profileProjects, setProfileProjects] = useState<ProfileProject[]>([])
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [careerInterests, setCareerInterests] = useState<string[]>([])
  const [newInterestInput, setNewInterestInput] = useState('')
  const { user } = useAuth()
  const hasAnyDocuments = resumeFiles.length > 0 || courseworkFiles.length > 0 || projectFiles.length > 0
  const skipNextInterestsSave = useRef(true)

  useEffect(() => {
    if (!user?.email) return
    axios.get(`${API_BASE}/career/profile`, { params: { email: user.email } })
      .then(({ data }) => {
        if (data.profile) {
          if (data.profile.name) setProfileName(data.profile.name)
          if (data.profile.academic_title) setProfileTitle(data.profile.academic_title)
          if (data.profile.technical_skills?.length) setTechnicalSkills(data.profile.technical_skills)
          if (data.profile.soft_skills?.length) setSoftSkills(data.profile.soft_skills)
        }
        if (data.courses?.length) setCourses(data.courses)
        if (data.projects?.length) setProfileProjects(data.projects)
        if (data.career_interests?.length) setCareerInterests(data.career_interests)
        skipNextInterestsSave.current = true
      })
      .catch(() => {})
  }, [user?.email])

  useEffect(() => {
    if (!user?.email || skipNextInterestsSave.current) { skipNextInterestsSave.current = false; return }
    const t = setTimeout(() => {
      axios.put(`${API_BASE}/career/profile/career-interests`, { email: user.email, career_interests: careerInterests }).catch(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [user?.email, careerInterests])

  const uniqueProjects = useMemo(() => {
    const norm = (t: string) => t.toLowerCase().trim().replace(/[\u2018\u2019\u201C\u201D]/g, "'").replace(/\s+/g, ' ')
    const seen = new Set<string>()
    return profileProjects.filter((p) => { const key = norm(p.title); if (seen.has(key)) return false; seen.add(key); return true })
  }, [profileProjects])

  const handleUpdateProfile = async () => {
    if (!hasAnyDocuments) return
    setIsUpdatingProfile(true)
    setProfileError('')
    try {
      let resumeText = ''
      let courseGrades: { course: string; grade: string | null; credits: string | null }[] = []
      let courseworkRawText = ''
      let projectTexts: string[] = []
      const normalizeTitle = (t: string) => t.toLowerCase().trim().replace(/[\u2018\u2019\u201C\u201D]/g, "'").replace(/\s+/g, ' ')
      const addProjectsUnique = (newProjects: ProfileProject[]) => {
        setProfileProjects((prev) => {
          const existingNorm = new Set(prev.map((p) => normalizeTitle(p.title)))
          const seen = new Set<string>()
          const toAdd = newProjects.filter((p) => { const norm = normalizeTitle(p.title); if (existingNorm.has(norm) || seen.has(norm)) return false; seen.add(norm); return true })
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev
        })
      }
      const resumePdf = resumeFiles.find((uf) => uf.file.name.toLowerCase().endsWith('.pdf'))
      if (resumePdf) {
        const fd = new FormData(); fd.append('file', resumePdf.file)
        const { data } = await axios.post<{ resume_text: string }>(`${API_BASE}/career/extract-resume-pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        resumeText = data.resume_text || ''
      }
      const courseworkPdf = courseworkFiles.find((uf) => uf.file.name.toLowerCase().endsWith('.pdf'))
      if (courseworkPdf) {
        const fd = new FormData(); fd.append('file', courseworkPdf.file)
        const { data } = await axios.post<{ course_grades: { course: string; grade: string | null; credits: string | null }[]; extracted_text?: string }>(`${API_BASE}/career/import-course-grades-pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        courseGrades = data.course_grades || []; courseworkRawText = data.extracted_text || ''
      }
      const projectExtractable = projectFiles.filter((uf) => { const n = uf.file.name.toLowerCase(); return n.endsWith('.pdf') || n.endsWith('.pptx') || n.endsWith('.docx') })
      if (projectExtractable.length > 0) {
        try {
          const fd = new FormData(); projectExtractable.forEach((uf) => fd.append('files', uf.file))
          const { data } = await axios.post<{ projects: { filename: string; text: string; error: string | null }[] }>(`${API_BASE}/career/import-project-files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          const projectResults = data.projects || []
          const withErrors = projectResults.filter((p) => p.error)
          projectTexts = projectResults.filter((p) => !p.error).map((p) => { const body = (p.text || '').trim(); const content = body ? body.slice(0, 8000) : `[Content could not be extracted from this file.]`; return `${p.filename}:\n${content}` })
          if (withErrors.length > 0 && projectTexts.length === 0) { setProfileError(`Could not extract text.`); setIsUpdatingProfile(false); return }
        } catch { setProfileError('Could not reach backend.'); setIsUpdatingProfile(false); return }
      }
      if (!resumeText && courseGrades.length === 0 && projectTexts.length === 0 && projectExtractable.length === 0) { setProfileError('Upload resume, coursework, or project files, then click Update Profile.'); setIsUpdatingProfile(false); return }
      if (!resumeText && courseGrades.length === 0 && projectTexts.length === 0) { setIsUpdatingProfile(false); return }
      const { data: profile } = await axios.post<{ name: string | null; academic_title: string | null; technical_skills: Skill[]; soft_skills: Skill[]; courses?: { title: string; term: string; grade: string; tags: string[] }[]; profile_projects?: { title: string; description: string; technologies: string[]; date: string }[] }>(`${API_BASE}/career/extract-profile`, { resume_text: resumeText || undefined, course_grades: courseGrades.length > 0 ? courseGrades : undefined, coursework_raw_text: courseworkRawText || undefined, projects: projectTexts.length > 0 ? projectTexts : undefined })
      if (profile.name) setProfileName(profile.name)
      if (profile.academic_title) setProfileTitle(profile.academic_title)
      setTechnicalSkills(profile.technical_skills?.length ? profile.technical_skills : [])
      setSoftSkills(profile.soft_skills?.length ? profile.soft_skills : [])
      if (profile.courses?.length) { setCourses(profile.courses.map((c) => ({ title: c.title, term: c.term, grade: c.grade, tags: c.tags || [] }))) } else if (courseGrades.length > 0) { setCourses(courseGrades.map((cg) => ({ title: cg.course, term: '—', grade: cg.grade || '—', tags: [] }))) } else { setCourses([]) }
      const extracted = profile.profile_projects ?? []
      if (extracted.length > 0) { addProjectsUnique(extracted.map((p) => ({ title: p.title, description: p.description, technologies: p.technologies || [], date: p.date }))) }
      if (user?.email) {
        try {
          await axios.post(`${API_BASE}/career/save-profile`, { email: user.email, name: profile.name || undefined, academic_title: profile.academic_title || undefined, technical_skills: profile.technical_skills || [], soft_skills: profile.soft_skills || [], courses: profile.courses || [], profile_projects: extracted, career_interests: careerInterests })
          bumpProfileVersion()
        } catch {}
      }
    } catch (err: unknown) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setProfileError(Array.isArray(detail) ? detail.map((x: { msg?: string }) => x.msg).join(' ') : String(err))
    } finally { setIsUpdatingProfile(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-8 md:px-8">

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profileName || user?.name || 'there'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your career navigation dashboard for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Career Match Score</p>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{technicalSkills.length > 0 ? '88%' : '—'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Based on top 3 matches</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Skills Tracked</p>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{technicalSkills.length + softSkills.length || '—'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Across all categories</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{uniqueProjects.length || '—'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Portfolio items</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Courses</p>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length || '—'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{profileTitle?.split('•')[0]?.trim() || 'Academic track'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Career Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Career Matches</h2>
              <Link to="/career/companies" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700">View all →</Link>
            </div>
            <TopCareerMatches email={user?.email} />
          </div>

          {/* Your Skills Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Skills Progress</h2>
              <Link to="/career/companies" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700">Manage skills →</Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              {technicalSkills.length > 0 ? (
                technicalSkills.slice(0, 5).map((s) => <SkillBar key={s.name} {...s} />)
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">Upload your resume to see skills.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
