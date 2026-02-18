import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface UploadedFile {
  id: string
  file: File
  size: string
  date: string
}

type DocumentCategory = 'resume' | 'coursework' | 'projects'

interface ProfileContextValue {
  resumeFiles: UploadedFile[]
  courseworkFiles: UploadedFile[]
  projectFiles: UploadedFile[]
  addFiles: (category: DocumentCategory, fileList: FileList) => void
  removeFile: (category: DocumentCategory, id: string) => void
  setResumeFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  setCourseworkFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  setProjectFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  profileVersion: number
  bumpProfileVersion: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatFileDate(file: File): string {
  const d = file.lastModified ? new Date(file.lastModified) : new Date()
  const mon = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${mon} ${year}`
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [resumeFiles, setResumeFiles] = useState<UploadedFile[]>([])
  const [courseworkFiles, setCourseworkFiles] = useState<UploadedFile[]>([])
  const [projectFiles, setProjectFiles] = useState<UploadedFile[]>([])
  const [profileVersion, setProfileVersion] = useState(0)

  const bumpProfileVersion = useCallback(() => setProfileVersion((v) => v + 1), [])

  const addFiles = useCallback((category: DocumentCategory, fileList: FileList) => {
    const list = Array.from(fileList)
    const newFiles: UploadedFile[] = list.map((file) => ({
      id: `${category}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      size: formatFileSize(file.size),
      date: formatFileDate(file),
    }))
    if (category === 'resume') {
      setResumeFiles((prev) => [...prev, ...newFiles])
    } else if (category === 'coursework') {
      setCourseworkFiles((prev) => [...prev, ...newFiles])
    } else {
      setProjectFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const removeFile = useCallback((category: DocumentCategory, id: string) => {
    if (category === 'resume') {
      setResumeFiles((prev) => prev.filter((f) => f.id !== id))
    } else if (category === 'coursework') {
      setCourseworkFiles((prev) => prev.filter((f) => f.id !== id))
    } else {
      setProjectFiles((prev) => prev.filter((f) => f.id !== id))
    }
  }, [])

  const value: ProfileContextValue = {
    resumeFiles,
    courseworkFiles,
    projectFiles,
    addFiles,
    removeFile,
    setResumeFiles,
    setCourseworkFiles,
    setProjectFiles,
    profileVersion,
    bumpProfileVersion,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
