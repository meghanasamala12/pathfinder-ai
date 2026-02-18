import { useState, useRef, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { API_BASE } from '../config'

// Icons as inline SVG components
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
const PencilIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)
const PlusIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

interface Skill {
  name: string
  percent: number
}

interface Course {
  title: string
  term: string
  grade: string
  tags: string[]
}

interface ProfileProject {
  title: string
  description: string
  technologies: string[]
  date: string
}

interface UploadedFile {
  id: string
  file: File
  size: string
  date: string
}

const RESUME_ACCEPT = '.pdf,.doc,.docx'
const COURSEWORK_ACCEPT = '.pdf,.doc,.docx'
const PROJECTS_ACCEPT = '.pdf,.doc,.docx,.pptx,.zip'

function SkillBar({ name, percent }: Skill) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-800">{name}</span>
        <span className="text-sm text-gray-500">{percent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

interface DocumentUploadSectionProps {
  title: string
  description: string
  accept: string
  files: UploadedFile[]
  onAdd: (files: FileList) => void
  onRemove: (id: string) => void
}

function DocumentUploadSection({ title, description, accept, files, onAdd, onRemove }: DocumentUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) onAdd(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (list?.length) onAdd(list)
    e.target.value = ''
  }

  const handleDownload = (uf: UploadedFile) => {
    const url = URL.createObjectURL(uf.file)
    const a = document.createElement('a')
    a.href = url
    a.download = uf.file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <UploadIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">Drag and drop your files here, or browse</p>
        <p className="text-xs text-gray-500 mb-4">
          Supported formats: {accept.split(',').map((e) => e.trim().replace(/^\./, '').toUpperCase()).join(', ')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <UploadIcon className="w-4 h-4" />
          Choose Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files ({files.length})</p>
          <ul className="space-y-2">
            {files.map((uf) => (
              <li
                key={uf.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <span className="text-sm font-medium text-gray-800 truncate flex-1">{uf.file.name}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{uf.size}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{uf.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600" title="Uploaded">
                    <CheckIcon />
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownload(uf)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Download"
                  >
                    <DownloadIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(uf.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                    title="Remove"
                  >
                    <XIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', term: '', grade: '', tagsInput: '' })
  const [careerInterests, setCareerInterests] = useState<string[]>([])
  const [newInterestInput, setNewInterestInput] = useState('')

  const { user } = useAuth()
  const hasAnyDocuments = resumeFiles.length > 0 || courseworkFiles.length > 0 || projectFiles.length > 0
  const skipNextInterestsSave = useRef(true)

  // Load saved profile from PostgreSQL when user is logged in
  useEffect(() => {
    if (!user?.email) return
    axios
      .get(`${API_BASE}/career/profile`, { params: { email: user.email } })
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

  // Persist career interests when user adds/removes
  useEffect(() => {
    if (!user?.email || skipNextInterestsSave.current) {
      skipNextInterestsSave.current = false
      return
    }
    const t = setTimeout(() => {
      axios
        .put(`${API_BASE}/career/profile/career-interests`, {
          email: user.email,
          career_interests: careerInterests,
        })
        .catch(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [user?.email, careerInterests])

  const uniqueProjects = useMemo(() => {
    const norm = (t: string) =>
      t
        .toLowerCase()
        .trim()
        .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
        .replace(/\s+/g, ' ')
    const seen = new Set<string>()
    return profileProjects.filter((p) => {
      const key = norm(p.title)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
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

      const normalizeTitle = (t: string) =>
        t
          .toLowerCase()
          .trim()
          .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
          .replace(/\s+/g, ' ')

      const addProjectsUnique = (newProjects: ProfileProject[]) => {
        setProfileProjects((prev) => {
          const existingNorm = new Set(prev.map((p) => normalizeTitle(p.title)))
          const seen = new Set<string>()
          const toAdd = newProjects.filter((p) => {
            const norm = normalizeTitle(p.title)
            if (existingNorm.has(norm) || seen.has(norm)) return false
            seen.add(norm)
            return true
          })
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev
        })
      }

      // Extract resume from first PDF
      const resumePdf = resumeFiles.find((uf) => uf.file.name.toLowerCase().endsWith('.pdf'))
      if (resumePdf) {
        const fd = new FormData()
        fd.append('file', resumePdf.file)
        const { data } = await axios.post<{ resume_text: string }>(
          `${API_BASE}/career/extract-resume-pdf`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        resumeText = data.resume_text || ''
      }

      // Extract course grades from first coursework PDF
      const courseworkPdf = courseworkFiles.find((uf) => uf.file.name.toLowerCase().endsWith('.pdf'))
      if (courseworkPdf) {
        const fd = new FormData()
        fd.append('file', courseworkPdf.file)
        const { data } = await axios.post<{
          course_grades: { course: string; grade: string | null; credits: string | null }[]
          extracted_text?: string
        }>(`${API_BASE}/career/import-course-grades-pdf`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        courseGrades = data.course_grades || []
        courseworkRawText = data.extracted_text || ''
      }

      // Extract project files (PDF, PPTX, DOCX)
      const projectExtractable = projectFiles.filter(
        (uf) => {
          const n = uf.file.name.toLowerCase()
          return n.endsWith('.pdf') || n.endsWith('.pptx') || n.endsWith('.docx')
        }
      )
      if (projectExtractable.length > 0) {
        try {
          const fd = new FormData()
          projectExtractable.forEach((uf) => fd.append('files', uf.file))
          const { data } = await axios.post<{
            projects: { filename: string; text: string; error: string | null }[]
          }>(`${API_BASE}/career/import-project-files`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          const projectResults = data.projects || []
          const withErrors = projectResults.filter((p) => p.error)
          projectTexts = projectResults
            .filter((p) => !p.error)
            .map((p) => {
              const body = (p.text || '').trim()
              const content = body
                ? body.slice(0, 8000)
                : `[Content could not be extracted from this file. Please infer a project title and brief description from the filename.]`
              return `${p.filename}:\n${content}`
            })
          if (withErrors.length > 0 && projectTexts.length === 0) {
            const errMsg = withErrors.map((p) => `${p.filename}: ${p.error}`).join('; ')
            setProfileError(`Could not extract text: ${errMsg}. Install python-docx for DOCX: pip install python-docx`)
            addProjectsUnique(
              projectExtractable.map((uf) => ({
                title: uf.file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Project',
                description: `Uploaded: ${uf.file.name}`,
                technologies: [],
                date: '—',
              }))
            )
            setIsUpdatingProfile(false)
            return
          }
        } catch (e) {
          setProfileError('Could not reach backend to extract project files. Is the server running at ' + API_BASE + '?')
          setIsUpdatingProfile(false)
          return
        }
      }

      if (!resumeText && courseGrades.length === 0 && projectTexts.length === 0 && projectExtractable.length === 0) {
        setProfileError('Upload resume, coursework, or project files (PDF, PPTX, DOCX), then click Update Profile.')
        setIsUpdatingProfile(false)
        return
      }

      // If we have project files but no extracted text, add filenames
      if (projectExtractable.length > 0 && projectTexts.length === 0) {
        addProjectsUnique(
          projectExtractable.map((uf) => ({
            title: uf.file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Project',
            description: `Uploaded: ${uf.file.name}`,
            technologies: [],
            date: '—',
          }))
        )
        setProfileError('')
      }

      // Skip API call if we have nothing to analyze
      if (!resumeText && courseGrades.length === 0 && projectTexts.length === 0) {
        setIsUpdatingProfile(false)
        return
      }

      const { data: profile } = await axios.post<{
        name: string | null
        academic_title: string | null
        technical_skills: Skill[]
        soft_skills: Skill[]
        courses?: { title: string; term: string; grade: string; tags: string[] }[]
        profile_projects?: { title: string; description: string; technologies: string[]; date: string }[]
      }>(`${API_BASE}/career/extract-profile`, {
        resume_text: resumeText || undefined,
        course_grades: courseGrades.length > 0 ? courseGrades : undefined,
        coursework_raw_text: courseworkRawText || undefined,
        projects: projectTexts.length > 0 ? projectTexts : undefined,
      })

      if (profile.name) setProfileName(profile.name)
      if (profile.academic_title) setProfileTitle(profile.academic_title)
      setTechnicalSkills(profile.technical_skills?.length ? profile.technical_skills : [])
      setSoftSkills(profile.soft_skills?.length ? profile.soft_skills : [])

      // Update coursework tab from extracted courses (with term and tags)
      if (profile.courses?.length) {
        setCourses(
          profile.courses.map((c) => ({
            title: c.title,
            term: c.term,
            grade: c.grade,
            tags: c.tags || [],
          }))
        )
      } else if (courseGrades.length > 0) {
        setCourses(
          courseGrades.map((cg) => ({
            title: cg.course,
            term: '—',
            grade: cg.grade || '—',
            tags: [],
          }))
        )
      } else {
        setCourses([])
      }

      // Add extracted projects to existing ones
      const extracted = profile.profile_projects ?? []
      if (extracted.length > 0) {
        addProjectsUnique(
          extracted.map((p) => ({
            title: p.title,
            description: p.description,
            technologies: p.technologies || [],
            date: p.date,
          }))
        )
      } else if (projectTexts.length > 0) {
        addProjectsUnique(
          projectTexts.map((pt) => {
            const idx = pt.indexOf('\n')
            const filename = idx >= 0 ? pt.slice(0, idx).replace(/:$/, '').trim() : 'Project'
            const body = idx >= 0 ? pt.slice(idx + 1) : pt
            const title = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Project'
            const desc = body.replace(/\s+/g, ' ').trim().slice(0, 120)
            return {
              title,
              description: desc ? `${desc}${body.trim().length > 120 ? '…' : ''}` : 'Project document',
              technologies: [],
              date: '—',
            }
          })
        )
      }

      // Save profile to PostgreSQL
      const finalProjects = extracted.length > 0
        ? extracted.map((p) => ({ title: p.title, description: p.description, technologies: p.technologies || [], date: p.date }))
        : projectTexts.length > 0
          ? projectTexts.map((pt) => {
              const idx = pt.indexOf('\n')
              const filename = idx >= 0 ? pt.slice(0, idx).replace(/:$/, '').trim() : 'Project'
              const body = idx >= 0 ? pt.slice(idx + 1) : pt
              const title = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Project'
              const desc = body.replace(/\s+/g, ' ').trim().slice(0, 120)
              return { title, description: desc || 'Project document', technologies: [] as string[], date: '—' }
            })
          : []
      const finalCourses = (profile.courses?.length ? profile.courses : courseGrades.map((cg) => ({ title: cg.course, term: '—' as string, grade: cg.grade || '—', tags: [] as string[] }))) || []
      if (user?.email) {
        try {
          await axios.post(`${API_BASE}/career/save-profile`, {
            email: user.email,
            name: profile.name || undefined,
            academic_title: profile.academic_title || undefined,
            technical_skills: profile.technical_skills || [],
            soft_skills: profile.soft_skills || [],
            courses: finalCourses,
            profile_projects: finalProjects,
            career_interests: careerInterests,
          })
          bumpProfileVersion()
        } catch {
          // Ignore save errors (e.g. DB not configured)
        }
      }
    } catch (err: unknown) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setProfileError(
        Array.isArray(detail)
          ? detail.map((x: { msg?: string }) => x.msg).join(' ')
          : String(err)
      )
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'coursework', label: 'Coursework', icon: <GraduationCapIcon /> },
    { id: 'projects', label: 'Projects', icon: <BriefcaseIcon /> },
    { id: 'interests', label: 'Interests', icon: <HeartIcon /> },
    { id: 'documents', label: 'Documents', icon: <DocumentIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8 md:px-8">
        {/* Header / Profile Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {profileName
                  ? profileName
                      .split(/\s+/)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : '?'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profileName || '—'}</h1>
              <p className="text-gray-500 mt-0.5">{profileTitle || '—'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-500">{courses.length} Courses</span>
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-500">{uniqueProjects.length} Projects</span>
              </div>
            </div>
          </div>
          <Link
            to="/career/companies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors self-start"
          >
            <PencilIcon />
            Edit Profile
          </Link>
        </div>

        {/* Skills Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Skills Overview</h2>
          {technicalSkills.length > 0 || softSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Technical Skills</h3>
                {technicalSkills.length > 0 ? (
                  technicalSkills.map((s) => <SkillBar key={s.name} {...s} />)
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Soft Skills</h3>
                {softSkills.length > 0 ? (
                  softSkills.map((s) => <SkillBar key={s.name} {...s} />)
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Upload resume, coursework, and project files in the Documents tab, then click Update Profile.</p>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-purple-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'coursework' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Coursework</h2>
                {courseworkFiles.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {courseworkFiles.length} file(s) uploaded in Documents. Click &quot;Load Courses&quot; to display them here.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {courseworkFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Loading…' : 'Load Courses'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddCourse(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon />
                  Add Course
                </button>
              </div>
            </div>

            {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.title}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{course.term}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">{course.grade}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="text-sm text-gray-500 py-8">
                {courseworkFiles.length > 0
                  ? 'Click Load Courses above, or add a course manually.'
                  : 'Upload coursework in the Documents tab, then click Update Profile. Or add a course manually above.'}
              </p>
            )}

            {showAddCourse && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add Course</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course name</label>
                      <input
                        type="text"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))}
                        placeholder="e.g. Data Structures"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <input
                          type="text"
                          value={newCourse.term}
                          onChange={(e) => setNewCourse((c) => ({ ...c, term: e.target.value }))}
                          placeholder="e.g. Fall 2025"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                        <input
                          type="text"
                          value={newCourse.grade}
                          onChange={(e) => setNewCourse((c) => ({ ...c, grade: e.target.value }))}
                          placeholder="e.g. A"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={newCourse.tagsInput}
                        onChange={(e) => setNewCourse((c) => ({ ...c, tagsInput: e.target.value }))}
                        placeholder="e.g. Algorithms, Python, Problem Solving"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCourse(false)
                        setNewCourse({ title: '', term: '', grade: '', tagsInput: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const title = newCourse.title.trim()
                        if (!title) return
                        const tags = newCourse.tagsInput
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean)
                        setCourses((prev) => [
                          ...prev,
                          {
                            title,
                            term: newCourse.term.trim() || '—',
                            grade: newCourse.grade.trim() || '—',
                            tags,
                          },
                        ])
                        setShowAddCourse(false)
                        setNewCourse({ title: '', term: '', grade: '', tagsInput: '' })
                      }}
                      disabled={!newCourse.title.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Projects</h2>
                {projectFiles.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {projectFiles.length} file(s) uploaded in Documents. Click &quot;Load Projects&quot; to display them here.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {projectFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Loading…' : 'Load Projects'}
                  </button>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon />
                  Add Project
                </button>
              </div>
            </div>
            {uniqueProjects.length > 0 ? (
            <div className="space-y-4">
              {uniqueProjects.map((project) => (
                <div
                  key={project.title}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">{project.date}</span>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="text-sm text-gray-500 py-8">Upload project files in the Documents tab, then click Load Projects or Update Profile.</p>
            )}
          </div>
        )}

        {activeTab === 'interests' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Career Interests</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add career areas or roles you&apos;re interested in (e.g. Data Engineering, Product Management).
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <input
                type="text"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = newInterestInput.trim()
                    if (val && !careerInterests.includes(val)) {
                      setCareerInterests((prev) => [...prev, val])
                      setNewInterestInput('')
                    }
                  }
                }}
                placeholder="Add career interest..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  const val = newInterestInput.trim()
                  if (val && !careerInterests.includes(val)) {
                    setCareerInterests((prev) => [...prev, val])
                    setNewInterestInput('')
                  }
                }}
                disabled={!newInterestInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                <PlusIcon />
                Add
              </button>
            </div>
            {careerInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {careerInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => setCareerInterests((prev) => prev.filter((i) => i !== interest))}
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5"
                      aria-label={`Remove ${interest}`}
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-6">
                No career interests yet. Add them above to specify roles or areas you&apos;re interested in.
              </p>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            {hasAnyDocuments && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Upload your resume, coursework, and project files (PDF, PPTX, DOCX). Click &quot;Update Profile&quot; to extract your profile and display projects in the Projects tab.
                </p>
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? 'Updating…' : 'Update Profile'}
                </button>
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{profileError}</div>
            )}
            <DocumentUploadSection
              title="Resume / CV"
              description="Upload your latest resume or CV (PDF, DOC, DOCX)"
              accept={RESUME_ACCEPT}
              files={resumeFiles}
              onAdd={(files) => addFiles('resume', files)}
              onRemove={(id) => removeFile('resume', id)}
            />
            <DocumentUploadSection
              title="Coursework & Syllabi"
              description="Upload course syllabi, transcripts, and other academic documents"
              accept={COURSEWORK_ACCEPT}
              files={courseworkFiles}
              onAdd={(files) => addFiles('coursework', files)}
              onRemove={(id) => removeFile('coursework', id)}
            />
            <DocumentUploadSection
              title="Project Files"
              description="Upload project documentation, code repositories (as ZIP), or presentations"
              accept={PROJECTS_ACCEPT}
              files={projectFiles}
              onAdd={(files) => addFiles('projects', files)}
              onRemove={(id) => removeFile('projects', id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
