import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { getAuthUrl, checkAuthStatus, logout, getAssignments, getClassroomLink } from '../services/classroomApi'

export default function GoogleClassroom() {
  const [searchParams] = useSearchParams()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      const authStatus = searchParams.get('auth')
      
      if (authStatus === 'success') {
        setAuthenticated(true)
        await fetchData()
      } else if (authStatus === 'error') {
        setError(searchParams.get('message') || 'Authentication failed')
        setLoading(false)
      } else {
        const isAuth = await checkAuthStatus()
        setAuthenticated(isAuth)
        if (isAuth) {
          await fetchData()
        }
        setLoading(false)
      }
    }
    initAuth()
  }, [searchParams])

  const fetchData = async () => {
    setFetchingData(true)
    setError(null)
    try {
      const data = await getAssignments()
      setAssignments(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setFetchingData(false)
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      const authUrl = await getAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      setError(err.message || 'Failed to get auth URL')
    }
  }

  const handleOpenClassroom = async () => {
    const url = await getClassroomLink()
    window.open(url, '_blank')
  }

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
    setAssignments([])
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return { date: 'No due date', time: '', isOverdue: false }
    const { year, month, day, hour, minute } = dueDate
    const date = new Date(year, month - 1, day, hour, minute)
    const now = new Date()
    const isOverdue = date < now
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    const dateStr = date.toLocaleDateString('en-US', options)
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    
    return { date: dateStr, time: timeStr, isOverdue }
  }

  const getCourseColor = (courseName) => {
    const colors = [
      { bg: 'rgba(96,239,255,0.15)', border: 'rgba(96,239,255,0.3)', text: '#60efff' },
      { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
      { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
      { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', text: '#fb923c' },
      { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', text: '#ec4899' },
      { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    ]
    const index = courseName.length % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.6)' }}>
          Loading...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ margin: '16px 16px 0', padding: '16px 24px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>
              📚 Google Classroom
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {authenticated ? `Connected • ${assignments.length} upcoming assignments` : 'Connect to view your assignments'}
            </p>
          </div>
          {authenticated && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleOpenClassroom} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(96,239,255,0.3)', background: 'rgba(96,239,255,0.15)', color: '#60efff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                🚀 Open Classroom
              </button>
              <button onClick={handleRefresh} disabled={fetchingData} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '12px', fontWeight: '600', cursor: fetchingData ? 'not-allowed' : 'pointer' }}>
                {fetchingData ? 'Refreshing...' : '🔄 Refresh'}
              </button>
              <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.15)', color: '#ec4899', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ margin: '16px', padding: '16px 20px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444', fontSize: '13px' }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ margin: '16px', flex: 1, overflowY: 'auto' }}>
        {!authenticated ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '24px' }}>
            <div style={{ fontSize: '64px', filter: 'drop-shadow(0 0 20px rgba(96,239,255,0.3))' }}>🎓</div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 8px', fontFamily: "'Playfair Display', serif" }}>
                Connect Your Google Classroom
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto' }}>
                Sign in with Google to view your assignments and deadlines.
              </p>
            </div>
            <button onClick={handleConnect} style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #60efff 0%, #9333ea 100%)', color: '#0a0a12', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(96,239,255,0.3)' }}>
              🔐 Connect with Google
            </button>
          </div>
        ) : fetchingData && assignments.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'rgba(255,255,255,0.6)' }}>
            Fetching your assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <p>No upcoming assignments with deadlines</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {assignments.map((assignment) => {
              const dueInfo = formatDueDate(assignment.dueDate)
              const colors = getCourseColor(assignment.courseName)
              return (
                <div key={assignment.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.border}`, backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '12px', background: colors.bg, color: colors.text, fontWeight: '600' }}>
                      {assignment.workType || 'Assignment'}
                    </span>
                    {dueInfo.isOverdue && (
                      <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: '600' }}>Overdue</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 8px', lineHeight: '1.4' }}>
                    {assignment.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: colors.text, margin: '0 0 12px' }}>
                    {assignment.courseName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: dueInfo.isOverdue ? '#ef4444' : 'rgba(255,255,255,0.5)' }}>
                    <span>📅</span>
                    <span style={dueInfo.isOverdue ? { fontWeight: '600' } : {}}>
                      {dueInfo.date} · {dueInfo.time}
                    </span>
                  </div>
                  {assignment.maxPoints && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      Max Points: <span style={{ color: '#fff', fontWeight: '600' }}>{assignment.maxPoints}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

function handleRefresh() { window.location.reload(); }
