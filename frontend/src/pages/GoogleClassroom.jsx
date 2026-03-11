import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import Layout from "../components/Layout"
import { colors, fonts, radius, shadows } from "../styles/tokens"
import { getAuthUrl, checkAuthStatus, logout, getAssignments, getClassroomLink } from "../services/classroomApi"

export default function GoogleClassroom() {
  const [searchParams] = useSearchParams()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState(null)

  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm }
  const cardInner = { background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md }
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary }
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted }
  const btn = { background: colors.primary.main, border: "none", borderRadius: radius.md, padding: "8px 16px", color: "#fff", fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }
  const btnGhost = { background: colors.bg.raised, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, padding: "8px 16px", color: colors.text.primary, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }

  useEffect(() => {
    const initAuth = async () => {
      const authStatus = searchParams.get("auth")
      if (authStatus === "success") {
        setAuthenticated(true)
        await fetchData()
      } else if (authStatus === "error") {
        setError(searchParams.get("message") || "Authentication failed")
        setLoading(false)
      } else {
        const isAuth = await checkAuthStatus()
        setAuthenticated(isAuth)
        if (isAuth) await fetchData()
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
      setError(err.message || "Failed to fetch data")
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
      setError(err.message || "Failed to get auth URL")
    }
  }

  const handleOpenClassroom = async () => {
    const url = await getClassroomLink()
    window.open(url, "_blank")
  }

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
    setAssignments([])
  }

  const handleRefresh = () => window.location.reload()

  const formatDueDate = (dueDate) => {
    if (!dueDate) return { date: "No due date", time: "", isOverdue: false }
    const { year, month, day, hour, minute } = dueDate
    const date = new Date(year, month - 1, day, hour, minute)
    const now = new Date()
    const isOverdue = date < now
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    return { date: dateStr, time: timeStr, isOverdue }
  }

  const getCourseColor = (courseName) => {
    const palette = [
      { main: colors.primary.main, ghost: colors.primary.ghost, border: colors.primary.border },
      { main: "#7C3AED", ghost: "rgba(124, 58, 237, 0.06)", border: "rgba(124, 58, 237, 0.20)" },
      { main: colors.success.main, ghost: colors.success.ghost, border: colors.success.border },
      { main: colors.warning.main, ghost: colors.warning.ghost, border: colors.warning.border },
      { main: colors.info.main, ghost: colors.info.ghost, border: "rgba(37, 99, 235, 0.20)" },
      { main: colors.error.main, ghost: colors.error.ghost, border: colors.error.border },
    ]
    return palette[courseName.length % palette.length]
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: colors.text.muted, fontFamily: fonts.body }}>
          Loading...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{ ...card, margin: "12px 12px 0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 3, height: 20, borderRadius: "2px", background: "#4285F4" }} />
            <h2 style={{ ...heading, fontSize: "15px", margin: 0, fontWeight: 700 }}>Google Classroom</h2>
          </div>
          <p style={{ ...caption, margin: "4px 0 0 11px" }}>
            {authenticated ? `Connected · ${assignments.length} upcoming assignments` : "Connect to view your assignments"}
          </p>
        </div>
        {authenticated && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleOpenClassroom} style={btnGhost}>Open Classroom</button>
            <button onClick={handleRefresh} disabled={fetchingData} style={{ ...btnGhost, cursor: fetchingData ? "not-allowed" : "pointer", opacity: fetchingData ? 0.5 : 1 }}>
              {fetchingData ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={handleLogout} style={{ ...btnGhost, color: colors.error.main, borderColor: colors.error.border }}>Disconnect</button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ margin: "12px", padding: "10px 16px", background: colors.error.ghost, border: `1px solid ${colors.error.border}`, borderRadius: radius.md, color: colors.error.main, fontSize: fonts.size.sm, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: colors.error.main, cursor: "pointer", fontSize: "16px", fontFamily: fonts.body }}>×</button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {!authenticated ? (
          /* Not Connected State */
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, padding: "40px", textAlign: "center", maxWidth: "420px", width: "100%", boxShadow: shadows.lg }}>
              <div style={{ width: 56, height: 56, borderRadius: radius.xl, background: colors.primary.ghost, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: `1px solid ${colors.primary.border}` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <h3 style={{ ...heading, fontSize: fonts.size.xl, margin: "0 0 8px" }}>Connect Google Classroom</h3>
              <p style={{ ...muted, margin: "0 0 24px", lineHeight: 1.5 }}>
                Sign in with your Google account to view upcoming assignments, deadlines, and coursework in one place.
              </p>
              <button onClick={handleConnect} style={{ ...btn, padding: "10px 28px", fontSize: fonts.size.base }}>
                Connect with Google
              </button>
            </div>
          </div>
        ) : (
          /* Connected State */
          <>
            {/* Main Panel */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
                {[
                  { num: assignments.length.toString(), label: "Total Assignments", color: colors.primary.main },
                  { num: assignments.filter(a => { const d = a.dueDate; if (!d) return false; const due = new Date(d.year, d.month-1, d.day); const now = new Date(); const diff = Math.ceil((due - now) / (1000*60*60*24)); return diff <= 3 && diff >= 0 }).length.toString(), label: "Due Soon", color: colors.error.main },
                  { num: assignments.filter(a => { const d = a.dueDate; if (!d) return false; return new Date(d.year, d.month-1, d.day) < new Date() }).length.toString(), label: "Overdue", color: colors.warning.main },
                  { num: [...new Set(assignments.map(a => a.courseName))].length.toString(), label: "Courses", color: colors.success.main },
                ].map((stat, i) => (
                  <div key={i} style={{ ...card, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 600, color: stat.color, marginBottom: "2px", fontVariantNumeric: "tabular-nums", fontFamily: fonts.heading }}>{stat.num}</div>
                    <div style={muted}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Assignments List */}
              {fetchingData && assignments.length === 0 ? (
                <div style={{ ...card, padding: "40px", textAlign: "center", color: colors.text.muted }}>
                  Fetching your assignments...
                </div>
              ) : assignments.length === 0 ? (
                <div style={{ ...card, padding: "40px", textAlign: "center", color: colors.text.muted }}>
                  No upcoming assignments with deadlines
                </div>
              ) : (
                <div style={{ ...card, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
                    <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Upcoming Assignments</h3>
                    <span style={{ marginLeft: "auto", ...muted }}>{assignments.length} total</span>
                  </div>
                  {assignments.map((assignment, i) => {
                    const dueInfo = formatDueDate(assignment.dueDate)
                    const courseColor = getCourseColor(assignment.courseName)
                    return (
                      <div key={assignment.id} style={{
                        padding: "10px 16px",
                        borderBottom: i < assignments.length - 1 ? `1px solid ${colors.border.subtle}` : "none",
                        transition: "background 0.1s ease",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = colors.bg.raised}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: courseColor.main, marginTop: "5px", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <div style={{ fontSize: fonts.size.base, fontWeight: 500, color: colors.text.primary }}>{assignment.title}</div>
                              {assignment.workType && (
                                <span style={{ background: courseColor.ghost, color: courseColor.main, fontSize: "9px", fontWeight: 600, padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase" }}>{assignment.workType}</span>
                              )}
                              {dueInfo.isOverdue && (
                                <span style={{ background: colors.error.ghost, color: colors.error.main, fontSize: "9px", fontWeight: 600, padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase" }}>Overdue</span>
                              )}
                            </div>
                            <div style={{ ...muted, marginBottom: "4px" }}>{assignment.courseName}</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ ...caption, color: dueInfo.isOverdue ? colors.error.main : colors.text.muted, fontWeight: dueInfo.isOverdue ? 500 : 400 }}>
                                {dueInfo.date} · {dueInfo.time}
                              </span>
                              {assignment.maxPoints && (
                                <span style={caption}>{assignment.maxPoints} pts</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Courses Breakdown */}
              <div style={{ ...card, padding: "12px" }}>
                <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Courses</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[...new Set(assignments.map(a => a.courseName))].map((course, i) => {
                    const courseColor = getCourseColor(course)
                    const count = assignments.filter(a => a.courseName === course).length
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", ...cardInner }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: courseColor.main, flexShrink: 0 }} />
                          <span style={{ fontSize: fonts.size.sm, color: colors.text.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>{course}</span>
                        </div>
                        <span style={{ fontSize: fonts.size.sm, fontWeight: 600, color: courseColor.main }}>{count}</span>
                      </div>
                    )
                  })}
                  {assignments.length === 0 && (
                    <div style={{ ...caption, padding: "8px 0", textAlign: "center" }}>No courses found</div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ ...card, padding: "12px" }}>
                <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Quick Actions</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Open Google Classroom", onClick: handleOpenClassroom },
                    { label: "Refresh Assignments", onClick: handleRefresh },
                    { label: "Disconnect Account", onClick: handleLogout },
                  ].map((action, i) => (
                    <button key={i} onClick={action.onClick} style={{
                      ...cardInner, padding: "8px 10px", color: i === 2 ? colors.error.main : colors.text.secondary,
                      fontSize: fonts.size.sm, cursor: "pointer", display: "flex", alignItems: "center",
                      gap: "8px", textAlign: "left", transition: "background 0.1s ease", fontFamily: fonts.body,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = i === 2 ? colors.error.ghost : colors.primary.ghost; e.currentTarget.style.color = i === 2 ? colors.error.main : colors.primary.main }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg.raised; e.currentTarget.style.color = i === 2 ? colors.error.main : colors.text.secondary }}>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div style={{ ...card, padding: "12px", flex: 1 }}>
                <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>About</h4>
                <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 4px" }}>Assignments are synced from your Google Classroom account.</p>
                  <p style={{ margin: "0 0 4px" }}>Only future assignments with due dates are shown.</p>
                  <p style={{ margin: 0 }}>Click Refresh to fetch the latest data.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
