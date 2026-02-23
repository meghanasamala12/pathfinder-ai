import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../config'

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const GraduationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
)
const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
  </svg>
)
const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

interface Alumni {
  name: string
  role: string
  company: string
  location: string
  degree: string
  class_year: number
  bio: string
  expertise: string[]
  linkedin_search: string
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']

function AlumniCard({ alumni, index, university }: { alumni: Alumni; index: number; university: string }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const uniShort = university.split(' ').slice(-2).join(' ')

  // Real LinkedIn search URLs - search for actual people, not fictional ones
  const linkedInByRoleUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(university + ' ' + alumni.role + ' ' + alumni.company)}`
  const linkedInBySkillUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(university + ' ' + (alumni.expertise[0] || '') + ' ' + alumni.company)}`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-lg">{alumni.company[0]}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{alumni.role}</p>
            <p className="text-sm font-medium text-gray-600">{alumni.company}</p>
            <p className="text-xs text-gray-400">{alumni.location}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">AI Suggested</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <GraduationIcon />{alumni.degree} • Class of {alumni.class_year}
      </div>

      <p className="text-sm text-gray-600 mb-4">{alumni.bio}</p>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {(alumni.expertise || []).map(skill => (
            <span key={skill} className="px-2.5 py-1 rounded-full text-xs text-blue-600 bg-blue-50 font-medium">{skill}</span>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
        <p className="text-xs font-semibold text-indigo-700 mb-2">🔍 Find real alumni like this on LinkedIn:</p>
        <div className="flex flex-col gap-2">
          <a href={linkedInByRoleUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">
            <LinkedInIcon /> {uniShort} · {alumni.role} · {alumni.company}
          </a>
          <a href={linkedInBySkillUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors bg-white">
            <LinkedInIcon /> {uniShort} · {alumni.expertise[0]} · {alumni.company}
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AlumniNetwork() {
  const { user } = useAuth()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(false)
  const [university, setUniversity] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('')
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    if (!user?.email) return
    axios.get(`${API_BASE}/career/profile`, { params: { email: user.email } })
      .then(({ data }) => {
        const title = data.profile?.academic_title || ''
        const uni = title.split('•')[0]?.trim() || title.split(',')[0]?.trim() || ''
        setUniversity(uni)
        setLinkedInUrl(data.profile?.linkedin_url || '')
        setProfileLoaded(true)
      }).catch(() => setProfileLoaded(true))
  }, [user?.email])

  // If LinkedIn URL not provided, show prompt
  if (profileLoaded && !linkedInUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8 md:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Alumni Network</h1>
            <p className="text-gray-500 mt-1">Connect with alumni from your university in your target companies and roles</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto mt-16">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your LinkedIn First</h2>
            <p className="text-gray-500 text-sm mb-6">To generate personalized alumni suggestions based on your career interests and background, please add your LinkedIn profile URL in your Profile settings.</p>
            <a href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
              Go to Profile → Add LinkedIn
            </a>
          </div>
        </div>
      </div>
    )
  }

  const generateAlumni = async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/career/generate-alumni`, { email: user.email })
      setAlumni(data.alumni || [])
    } catch {
      setAlumni([])
    } finally {
      setLoading(false)
    }
  }

  const companies = useMemo(() => Array.from(new Set(alumni.map(a => a.company))).sort(), [alumni])
  const expertiseList = useMemo(() => Array.from(new Set(alumni.flatMap(a => a.expertise || []))).sort(), [alumni])
  const filtered = useMemo(() => alumni.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
    const matchCompany = !companyFilter || a.company === companyFilter
    const matchExpertise = !expertiseFilter || (a.expertise || []).includes(expertiseFilter)
    return matchSearch && matchCompany && matchExpertise
  }), [search, companyFilter, expertiseFilter, alumni])

  const uniKeyword = university.replace(/Master of Science in|Bachelor of Science in|Bachelor of|•.*$/g, '').trim()
  const linkedInAlumniUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((uniKeyword || 'university') + ' alumni')}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Alumni Network</h1>
          <p className="text-gray-500 mt-1">Connect with alumni from your university in your target companies and roles</p>
        </div>

        {/* Banner */}
        <div className="rounded-2xl p-6 mb-8 text-white" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
          <h2 className="text-xl font-bold mb-1">
            {uniKeyword ? `${uniKeyword} Alumni Network` : 'Alumni Network'}
          </h2>
          <p className="text-blue-100 mb-5">
            {alumni.length > 0
              ? `Connect with ${alumni.length} AI-suggested alumni working at target companies. They're here to help!`
              : 'Find alumni from your university working in your dream roles. Click Generate to discover them!'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={generateAlumni} disabled={loading || !profileLoaded}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-60">
              <SparkleIcon />
              {loading ? 'Generating…' : alumni.length > 0 ? 'Regenerate Alumni' : 'Generate Alumni'}
            </button>
            <a href={linkedInAlumniUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm border border-indigo-400 hover:bg-indigo-700 transition-colors">
              <LinkedInIcon /> Search LinkedIn
            </a>
          </div>
        </div>

        {/* Empty state */}
        {!loading && alumni.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <SparkleIcon />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Discover Your Alumni Network</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {profileLoaded && uniKeyword
                ? `We'll find alumni from "${uniKeyword}" who work in roles matching your career interests.`
                : 'Add your resume and career interests in your Profile first, then generate alumni matches.'}
            </p>
            <button type="button" onClick={generateAlumni} disabled={loading || !profileLoaded}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60">
              <SparkleIcon />
              {loading ? 'Generating…' : 'Generate Alumni'}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center mb-6">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Finding alumni from your university...</p>
          </div>
        )}

        {/* Search + Filters + Grid */}
        {alumni.length > 0 && !loading && (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <div className="relative mb-5">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><SearchIcon /></div>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, company, or role..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-3"><FilterIcon /><span className="font-semibold text-gray-900">Filters</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Company</label>
                  <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">All Companies</option>
                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Expertise</label>
                  <select value={expertiseFilter} onChange={e => setExpertiseFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">All Expertise</option>
                    {expertiseList.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Showing {filtered.length} of {alumni.length} alumni</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a, i) => <AlumniCard key={a.name + i} alumni={a} index={i} university={uniKeyword} />)}
            </div>
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No alumni found matching your search. Try different filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
