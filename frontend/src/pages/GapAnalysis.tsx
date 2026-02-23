import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../config'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts'

interface Skill { name: string; level: number }
interface Job {
  id: number; title: string; company: string
  required_skills: string; match_score: number
  description: string; location: string
}

const RESOURCES: Record<string, string> = {
  'Python': 'https://www.coursera.org/learn/python',
  'SQL': 'https://www.kaggle.com/learn/intro-to-sql',
  'Machine Learning': 'https://www.coursera.org/learn/machine-learning',
  'Deep Learning': 'https://www.coursera.org/specializations/deep-learning',
  'PyTorch': 'https://pytorch.org/tutorials/',
  'TensorFlow': 'https://www.tensorflow.org/learn',
  'Apache Spark': 'https://spark.apache.org/docs/latest/',
  'Apache Beam': 'https://beam.apache.org/documentation/',
  'Hadoop': 'https://hadoop.apache.org/docs/stable/',
  'AWS': 'https://aws.amazon.com/training/',
  'Azure': 'https://learn.microsoft.com/en-us/azure/',
  'GCP': 'https://cloud.google.com/training',
  'Tableau': 'https://www.tableau.com/learn/training',
  'Docker': 'https://docs.docker.com/get-started/',
  'Kubernetes': 'https://kubernetes.io/docs/tutorials/',
  'Scala': 'https://www.coursera.org/learn/scala-functional-programming',
  'Java': 'https://www.coursera.org/learn/java-programming',
  'NLP': 'https://www.coursera.org/specializations/natural-language-processing',
}
function resourceLink(skill: string) {
  const key = Object.keys(RESOURCES).find(k => skill.toLowerCase().includes(k.toLowerCase()))
  return key ? RESOURCES[key] : `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`
}
function normalize(s: string) { return s.toLowerCase().trim() }
function parseSkills(str: string) { return str.split(',').map(s => s.trim()).filter(Boolean) }

const TrendIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
const InfoIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const ScoreIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const ExtIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>

export default function GapAnalysis() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

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

  const { matched, missing, matchPct, readiness } = useMemo(() => {
    if (!job) return { matched: [] as {name:string;level:number}[], missing: [] as {name:string}[], matchPct: 0, readiness: 0 }
    const userMap = Object.fromEntries(skills.map(s => [normalize(s.name), s.level]))
    const userNames = skills.map(s => normalize(s.name))
    const required = parseSkills(job.required_skills)
    const matched: {name:string;level:number}[] = []
    const missing: {name:string}[] = []
    required.forEach(skill => {
      const norm = normalize(skill)
      const found = userNames.find(u => u.includes(norm) || norm.includes(u))
      if (found) matched.push({ name: skill, level: userMap[found] || 70 })
      else missing.push({ name: skill })
    })
    const matchPct = required.length ? Math.round((matched.length / required.length) * 100) : 0
    const readiness = required.length ? Math.round((matched.length / required.length) * 100) : 0
    return { matched, missing, matchPct, readiness }
  }, [job, skills])

  const radarData = useMemo(() => {
    const m = matched.slice(0, 4).map(s => ({ skill: s.name.slice(0, 10), You: s.level, Required: 80 }))
    const ms = missing.slice(0, Math.max(0, 5 - m.length)).map(s => ({ skill: s.name.slice(0, 10), You: 0, Required: 80 }))
    return [...m, ...ms]
  }, [matched, missing])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!skills.length) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gap Analysis</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-1 font-medium">No skills found in your profile.</p>
          <p className="text-sm text-gray-400">Upload your resume in the Profile page first, then come back here.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gap Analysis</h1>
          <p className="text-gray-500 mt-1">Identify skill gaps and get personalized recommendations to reach your career goals</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Target Role</label>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200"></div>
            </div>
            <select value={selectedId ?? ''} onChange={e => setSelectedId(Number(e.target.value))}
              className="flex-1 max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 bg-white">
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title} at {j.company} — {j.match_score}% match</option>)}
            </select>
          </div>
          {job && <p className="text-xs text-gray-400 mt-2 ml-11">{job.location} · {job.description.slice(0, 90)}…</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-500 font-medium">Overall Readiness</span><TrendIcon /></div>
            <p className="text-4xl font-bold text-indigo-600 mb-3">{readiness}%</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gray-900 h-2 rounded-full transition-all" style={{ width: `${readiness}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-500 font-medium">Skills to Develop</span><InfoIcon /></div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{missing.length}</p>
            <p className="text-sm text-gray-500">{matched.length} skills already matched</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-500 font-medium">Match Score</span><ScoreIcon /></div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{matchPct}%</p>
            <p className="text-sm text-gray-500">Skills compatibility</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">✓</span>
              Skills You Have ({matched.length})
            </h2>
            {matched.length > 0 ? (
              <div className="space-y-3">
                {matched.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${s.level}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{s.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No matching skills found for this role.</p>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold">✕</span>
              Skills to Learn ({missing.length})
            </h2>
            {missing.length > 0 ? (
              <div className="space-y-3">
                {missing.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                      <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    </div>
                    <a href={resourceLink(s.name)} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                      Learn <ExtIcon />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-green-600 font-semibold text-lg">You have all required skills!</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Skills Comparison</h2>
            {radarData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Radar name="Required" dataKey="Required" stroke="#86efac" fill="#86efac" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="You" dataKey="You" stroke="#1f2937" fill="#1f2937" fillOpacity={0.6} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 justify-center mt-1">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-900"></div><span className="text-xs text-gray-500">You</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-300"></div><span className="text-xs text-gray-500">Required</span></div>
                </div>
              </>
            ) : <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Not enough data</div>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Skills Gap Overview</h2>
            {missing.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={missing.map(s => ({ name: s.name.slice(0, 10), gap: 80 }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}% needed`, 'Proficiency Required']} />
                  <Bar dataKey="gap" radius={[4, 4, 0, 0]} fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-green-600 font-semibold text-center">No skill gaps!<br/><span className="text-sm font-normal text-gray-400">You meet all requirements.</span></p>
              </div>
            )}
          </div>
        </div>

        {missing.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Detailed Skill Analysis</h2>
            <div className="space-y-6">
              {missing.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">{s.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${i < Math.ceil(missing.length / 2) ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
                        {i < Math.ceil(missing.length / 2) ? 'high priority' : 'medium priority'}
                      </span>
                    </div>
                    <a href={resourceLink(s.name)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      View Resources <ExtIcon />
                    </a>
                  </div>
                  <div className="flex gap-6 text-sm text-gray-500 mb-3">
                    <span>Current: <strong className="text-gray-900">0%</strong></span>
                    <span>Required: <strong className="text-gray-900">80%</strong></span>
                    <span className="text-red-500 font-semibold">Gap: 80%</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Your Level</span><span>0%</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-gray-900 h-2.5 rounded-full" style={{ width: '2%' }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Target Level</span><span>80%</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-green-400 h-2.5 rounded-full" style={{ width: '80%' }}></div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
