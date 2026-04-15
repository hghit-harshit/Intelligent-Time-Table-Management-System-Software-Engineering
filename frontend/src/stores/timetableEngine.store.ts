// ============================================================
// Timetable Engine Store — sessionStorage-based solver results storage
// Persists solver output (assignments, stats, constraints) across navigation
// ONLY within the current session - clears when browser is closed
// Includes both slot and classroom assignments
// ============================================================

const STORAGE_KEY = "disha_timetable_engine_results"

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted — reset */ }
  return null
}

function save(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Get the last saved solver results */
export function getSolverResults() {
  return load()
}

/** Save solver results to sessionStorage */
export function saveSolverResults(results) {
  const data = {
    assignments: results.assignments || [],
    stats: results.stats || null,
    constraints: results.constraints || {},
    timestamp: new Date().toISOString(),
    version: results.version || "v1",
    totalSlotsFilled: results.assignments?.length || 0,
  }
  save(data)
  return data
}

/** Clear saved results */
export function clearSolverResults() {
  sessionStorage.removeItem(STORAGE_KEY)
}
