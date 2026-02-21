import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../config'

interface Skill { name: string; level: number }
interface Job { id: number; title: string; company: string; required_skills: string; match_score: number }
interface Resource {
  id: string; title: string; provider: string
  type: 'course' | 'book' | 'video'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string; skills: string[]; url: string; forSkill: string
}

const RESOURCE_LIBRARY: Record<string, Resource[]> = {
  'Python': [
    { id: 'py1', title: 'Python for Everybody', provider: 'Coursera', type: 'course', level: 'beginner', duration: '8 weeks', skills: ['Python', 'Data Structures', 'APIs'], url: 'https://www.coursera.org/specializations/python', forSkill: 'Python' },
    { id: 'py2', title: 'Automate the Boring Stuff with Python', provider: 'Al Sweigart', type: 'book', level: 'intermediate', duration: 'Self-paced', skills: ['Python', 'Automation', 'Scripting'], url: 'https://automatetheboringstuff.com/', forSkill: 'Python' },
  ],
  'SQL': [
    { id: 'sql1', title: 'SQL for Data Science', provider: 'Coursera', type: 'course', level: 'beginner', duration: '4 weeks', skills: ['SQL', 'Data Analysis', 'Databases'], url: 'https://www.coursera.org/learn/sql-for-data-science', forSkill: 'SQL' },
    { id: 'sql2', title: 'Advanced SQL for Data Engineers', provider: 'Kaggle', type: 'course', level: 'intermediate', duration: 'Self-paced', skills: ['SQL', 'Window Functions', 'CTEs'], url: 'https://www.kaggle.com/learn/advanced-sql', forSkill: 'SQL' },
  ],
  'Apache Spark': [
    { id: 'spark1', title: 'Apache Spark with Python — PySpark', provider: 'Udemy', type: 'course', level: 'intermediate', duration: '10 weeks', skills: ['Apache Spark', 'PySpark', 'Big Data'], url: 'https://www.udemy.com/course/apache-spark-with-python-big-data-with-pyspark-and-spark/', forSkill: 'Apache Spark' },
  ],
  'Apache Beam': [
    { id: 'beam1', title: 'Apache Beam & Dataflow on GCP', provider: 'Google Cloud', type: 'course', level: 'intermediate', duration: 'Self-paced', skills: ['Apache Beam', 'Dataflow', 'Streaming'], url: 'https://cloud.google.com/dataflow/docs/guides/beam-overview', forSkill: 'Apache Beam' },
  ],
  'Hadoop': [
    { id: 'hadoop1', title: 'Hadoop Platform and Application Framework', provider: 'Coursera', type: 'course', level: 'intermediate', duration: '6 weeks', skills: ['Hadoop', 'HDFS', 'MapReduce'], url: 'https://www.coursera.org/learn/hadoop', forSkill: 'Hadoop' },
  ],
  'AWS': [
    { id: 'aws1', title: 'AWS Cloud Practitioner Essentials', provider: 'AWS Training', type: 'course', level: 'beginner', duration: '6 hours', skills: ['AWS', 'Cloud Computing', 'S3', 'EC2'], url: 'https://aws.amazon.com/training/', forSkill: 'AWS' },
    { id: 'aws2', title: 'AWS Solutions Architect Associate', provider: 'A Cloud Guru', type: 'course', level: 'advanced', duration: '12 weeks', skills: ['AWS', 'Architecture', 'Security'], url: 'https://acloudguru.com/', forSkill: 'AWS' },
  ],
  'Azure': [
    { id: 'az1', title: 'Azure Fundamentals AZ-900', provider: 'Microsoft Learn', type: 'course', level: 'beginner', duration: 'Self-paced', skills: ['Azure', 'Cloud Computing', 'DevOps'], url: 'https://learn.microsoft.com/en-us/azure/', forSkill: 'Azure' },
  ],
  'GCP': [
    { id: 'gcp1', title: 'Google Cloud Fundamentals: Core Infrastructure', provider: 'Google Cloud', type: 'course', level: 'beginner', duration: '8 hours', skills: ['GCP', 'Cloud Storage', 'BigQuery'], url: 'https://www.cloudskillsboost.google/', forSkill: 'GCP' },
  ],
  'Tableau': [
    { id: 'tab1', title: 'Tableau for Data Scientists', provider: 'Tableau', type: 'course', level: 'beginner', duration: 'Self-paced', skills: ['Tableau', 'Data Visualization', 'Dashboards'], url: 'https://www.tableau.com/learn/training', forSkill: 'Tableau' },
  ],
  'Machine Learning': [
    { id: 'ml1', title: 'Machine Learning Specialization', provider: 'Coursera', type: 'course', level: 'intermediate', duration: '3 months', skills: ['Machine Learning', 'Supervised Learning', 'Python'], url: 'https://www.coursera.org/specializations/machine-learning-introduction', forSkill: 'Machine Learning' },
  ],
  'Deep Learning': [
    { id: 'dl1', title: 'Deep Learning Specialization', provider: 'Coursera', type: 'course', level: 'advanced', duration: '5 months', skills: ['Deep Learning', 'Neural Networks', 'TensorFlow'], url: 'https://www.coursera.org/specializations/deep-learning', forSkill: 'Deep Learning' },
  ],
  'Scala': [
    { id: 'scala1', title: 'Functional Programming in Scala', provider: 'Coursera', type: 'course', level: 'intermediate', duration: '7 weeks', skills: ['Scala', 'Functional Programming', 'Spark'], url: 'https://www.coursera.org/specializations/scala', forSkill: 'Scala' },
  ],
  'Docker': [
    { id: 'dock1', title: 'Docker Mastery', provider: 'Udemy', type: 'course', level: 'intermediate', duration: '6 weeks', skills: ['Docker', 'Containers', 'DevOps'], url: 'https://www.udemy.com/course/docker-mastery/', forSkill: 'Docker' },
  ],
  'Kubernetes': [
    { id: 'k8s1', title: 'Kubernetes for Developers', provider: 'Linux Foundation', type: 'course', level: 'advanced', duration: '8 weeks', skills: ['Kubernetes', 'Orchestration', 'Microservices'], url: 'https://training.linuxfoundation.org/', forSkill: 'Kubernetes' },
  ],
}

function getResources(missingSkills: string[]): Resource[] {
  const results: Resource[] = []
  missingSkills.forEach(skill => {
    const key = Object.keys(RESOURCE_LIBRARY).find(k =>
      skill.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(skill.toLowerCase())
    )
    if (key) results.push(...RESOURCE_LIBRARY[key])
  })
  return results.filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)
}

function normalize(s: string) { return s.toLowerCase().trim() }
function parseSkills(str: string) { return str.split(',').map(s => s.trim()).filter(Boolean) }

const BookIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
const CourseIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
const ClockIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const CheckIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>

function TypeIcon({ type }: { type: Resource['type'] }) {
  const cls = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
  if (type === 'book') return <div className={`${cls} bg-indigo-100 text-indigo-600`}><BookIcon /></div>
  return <div className={`${cls} bg-blue-100 text-blue-600`}><CourseIcon /></div>
}

function levelBadge(level: Resource['level']) {
  if (level === 'beginner') return 'bg-green-100 text-green-700'
  if (level === 'intermediate') return 'bg-purple-100 text-purple-700'
  return 'bg-orange-100 text-orange-700'
}

function ResourceCard({ resource, completed, onComplete }: {
  resource: Resource; completed: boolean; onComplete: (id: string) => void
}) {
  return (
    <div className={`bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow ${completed ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start gap-4 mb-4">
        <TypeIcon type={resource.type} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-snug">{resource.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{resource.provider}</p>
        </div>
        {completed && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
            <CheckIcon /> Done
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${levelBadge(resource.level)}`}>{resource.level}</span>
        <span className="flex items-center gap-1 text-xs text-gray-500"><ClockIcon /> {resource.duration}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {resource.skills.map(s => (
          <span key={s} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">{s}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <a href={resource.url} target="_blank" rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors">
          Start Learning
        </a>
        {!completed && (
          <button onClick={() => onComplete(resource.id)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
            Mark Complete
          </button>
        )}
      </div>
    </div>
  )
}

type Tab = 'recommended' | 'all' | 'completed'

export default function LearningPaths() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('recommended')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('lp_completed')
    if (saved) setCompletedIds(new Set(JSON.parse(saved)))
  }, [])

  useEffect(() => {
    if (!user?.email) return
    setLoading(true)
    Promise.all([
      axios.get(`${API_BASE}/career/profile`, { params: { email: user.email } }),
      axios.get(`${API_BASE}/career/related-jobs`, { params: { email: user.email, limit: 16 } }),
    ]).then(([p, j]) => {
      setSkills(p.data.profile?.technical_skills || [])
      const jobList: Job[] = j.data.jobs || []
      setJobs(jobList)
      if (jobList.length > 0) setSelectedId(jobList[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.email])

  const job = useMemo(() => jobs.find(j => j.id === selectedId), [jobs, selectedId])

  const missingSkills = useMemo(() => {
    if (!job) return []
    const userNames = skills.map(s => normalize(s.name))
    return parseSkills(job.required_skills).filter(skill => {
      const norm = normalize(skill)
      return !userNames.find(u => u.includes(norm) || norm.includes(u))
    })
  }, [job, skills])

  const allResources = useMemo(() => getResources(missingSkills), [missingSkills])
  const recommendedResources = useMemo(() => allResources.filter(r => !completedIds.has(r.id)).slice(0, 6), [allResources, completedIds])
  const completedResources = useMemo(() => allResources.filter(r => completedIds.has(r.id)), [allResources, completedIds])

  const displayedResources = useMemo(() => {
    if (tab === 'recommended') return recommendedResources
    if (tab === 'completed') return completedResources
    return allResources
  }, [tab, recommendedResources, allResources, completedResources])

  const handleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('lp_completed', JSON.stringify([...next]))
      return next
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
          <p className="text-gray-500 mt-1">Personalized resources to develop skills and reach your career goals</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Learning Path For</label>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200"></div>
            </div>
            <select value={selectedId ?? ''} onChange={e => { setSelectedId(Number(e.target.value)); setTab('recommended') }}
              className="flex-1 max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 bg-white">
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title} at {j.company}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 font-medium mb-3">Recommended</p>
            <p className="text-3xl font-bold text-gray-900">{allResources.length}</p>
            <p className="text-xs text-gray-400 mt-1">Resources for you</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 font-medium mb-3">In Progress</p>
            <p className="text-3xl font-bold text-indigo-600">{allResources.filter(r => !completedIds.has(r.id)).length}</p>
            <p className="text-xs text-gray-400 mt-1">Currently learning</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 font-medium mb-3">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedIds.size}</p>
            <p className="text-xs text-gray-400 mt-1">Resources finished</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 font-medium mb-3">Priority Skills</p>
            <p className="text-3xl font-bold text-gray-900">{missingSkills.length}</p>
            <p className="text-xs text-gray-400 mt-1">High priority</p>
          </div>
        </div>

        {missingSkills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Skills to Focus On</h2>
            <p className="text-sm text-gray-500 mb-4">Based on your gap analysis, these are the high-priority skills to develop:</p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-semibold">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length === 0 && (
          <div className="bg-white rounded-2xl border border-green-200 p-6 mb-6 text-center">
            <p className="text-green-600 font-bold text-lg">You have all required skills for this role!</p>
            <p className="text-sm text-gray-400 mt-1">Try selecting a different role to find learning opportunities.</p>
          </div>
        )}

        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {(['recommended', 'all', 'completed'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t === 'recommended' ? 'Recommended' : t === 'all' ? 'All Resources' : 'Completed'}
            </button>
          ))}
        </div>

        {displayedResources.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {tab === 'recommended' ? 'Recommended for You' : tab === 'completed' ? 'Completed Resources' : 'All Resources'}
              </h2>
              <span className="text-sm text-gray-400">{displayedResources.length} resources</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedResources.map(r => (
                <ResourceCard key={r.id} resource={r} completed={completedIds.has(r.id)} onComplete={handleComplete} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            {tab === 'completed'
              ? <><p className="text-gray-500 font-medium">No completed resources yet.</p><p className="text-sm text-gray-400 mt-1">Click "Mark Complete" on any resource to track your progress.</p></>
              : <><p className="text-gray-500 font-medium">No resources found for missing skills.</p><p className="text-sm text-gray-400 mt-1">You may already have all required skills for this role!</p></>
            }
          </div>
        )}
      </div>
    </div>
  )
}
