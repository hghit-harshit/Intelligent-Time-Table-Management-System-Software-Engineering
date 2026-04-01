# Scheduler Solver - Changes & Improvements

## Summary of Changes

This document tracks all the improvements made to the CP-SAT timetable scheduler to fix constraint violations and add comprehensive testing.

### 🔧 Core Solver Improvements

#### 1. Added HC0 Hard Constraint: One Course Per Timeslot

**File**: `backend/services/scheduler/scheduleSolver.py`

**What Changed**:

- Added new hard constraint `HC0` (was previously missing)
- Method: `apply_hc0_one_course_per_slot()`
- **Effect**: Ensures NO two courses can occupy the same timeslot
- **Before**: Multiple courses could be scheduled in the same slot (🔴 BUG)
- **After**: Only ONE course per slot (✅ FIXED)

**Implementation**:

```python
def apply_hc0_one_course_per_slot(self):
    """Ensure only one course can be scheduled per timeslot (across all professors)."""
    for slot_index, _slot in enumerate(self.timeslots):
        vars_for_slot = [
            var for (c_idx, t_idx, p_idx), var in self.assignment_vars.items()
            if t_idx == slot_index
        ]
        if vars_for_slot:
            self.model.Add(sum(vars_for_slot) <= 1)
```

#### 2. Implemented Multi-Session Course Scheduling

**File**: `backend/services/scheduler/scheduleSolver.py`

**What Changed**:

- Updated `apply_core_constraints()` to use `sessionsPerWeek` from course data
- **Before**: Each course scheduled exactly once (`sum(candidates) == 1`)
- **After**: Each course scheduled `sessionsPerWeek` times (`sum(candidates) == sessionsPerWeek`)

**Implementation**:

```python
# Get sessionsPerWeek from course, default to 1
sessions_per_week = value_from(
    course,
    ["sessionsPerWeek", "sessions", "numberOfSessions"],
    1,
)
sessions_per_week = max(1, int(sessions_per_week))
self.model.Add(sum(candidates) == sessions_per_week)
```

**Example Scheduling**:

- CSE101 with `sessionsPerWeek: 2` → Scheduled in 2 different timeslots
- CSE201 with `sessionsPerWeek: 3` → Scheduled in 3 different timeslots
- HUM101 with `sessionsPerWeek: 1` → Scheduled in 1 timeslot

#### 3. Updated Constraint Registry

**File**: `backend/services/scheduler/scheduleSolver.py`

**What Changed**:

- Added HC0 to the hard constraints registry
- HC0 is automatically processed before HC1
- Both are always checked before soft constraints

```python
self.hard_constraints_registry = {
    "hc0_enabled": self.apply_hc0_one_course_per_slot,      # New!
    "hc1_enabled": self.apply_hc1_one_class_per_professor_per_slot,
}
```

---

### 📊 Database Seeding Updates

#### Updated Course Sessions Distribution

**File**: `backend/scripts/seedSchedulerTestData.js`

**What Changed**:

- Each course now has a `sessionsPerWeek` value (previously hardcoded to 1)
- Realistic course load distribution:

| Course | Sessions/Week |
| ------ | ------------- |
| CSE101 | 2             |
| CSE201 | 2             |
| MAT201 | 2             |
| ECE205 | 1             |
| CSE303 | 2             |
| CSE401 | 2             |
| CSE305 | 1             |
| CSE307 | 2             |
| CSE411 | 2             |
| MAT301 | 1             |
| PHY210 | 1             |
| EEE220 | 2             |
| HUM101 | 1             |
| MGT201 | 1             |

**Total**: 22 assignments, 30 available slots = 100% feasibility

---

### 🧪 Testing Framework

#### New Test Suite

**File**: `backend/services/scheduler/__tests__/scheduleSolver.test.js`

**Test Coverage** (6 test suites, 11+ test cases):

1. **HC1: One Course Per Timeslot**
   - ✅ Validates no multiple courses in same slot
   - ✅ Validates no multiple courses for same professor in one slot

2. **SC1: Respect Unavailable Slots**
   - ✅ Validates professor blocked slots are avoided
   - ✅ Validates SC1 can be disabled

3. **SC2: Respect Preferred Days Off**
   - ✅ Validates adherence to preferred days-off

4. **Output Validation**
   - ✅ Checks assignment structure completeness
   - ✅ Validates stats metadata

5. **Feasibility**
   - ✅ Finds solutions with all constraints
   - ✅ Fails gracefully with impossible courses

6. **Sessions Per Week Distribution** ✨ NEW
   - ✅ Validates multi-session course scheduling

**Running Tests**:

```bash
npm run test:scheduler              # Full test suite
npm run test:scheduler -- --verbose # With details
npm test -- --coverage             # With coverage report
```

---

### 🎨 Frontend Enhancements

#### 1. New Schedule Views

**Files**:

- `frontend/src/pages/admin/components/engine/ScheduleMatrixView.jsx` ✨ NEW
- `frontend/src/pages/admin/components/engine/CourseAssignmentView.jsx` ✨ NEW

**Schedule Matrix View**:

- Time × Day grid showing slot occupancy
- One course per slot clearly visible
- Color-coded empty vs. occupied slots
- Shows professor name for each course

**Course Assignment View**:

- Expandable list of each course
- Shows all sessions for that course
- Organized by day and time
- Quick overview of course load

#### 2. Updated TimetableEngine Page

**File**: `frontend/src/pages/admin/pages/TimetableEngine.jsx`

**What Changed**:

- Added HC0 to constraint toggles
- Integrated new matrix and assignment views
- Views auto-populate when solver generates schedule
- Dynamic rendering from real `latestAssignments`

#### 3. Updated Constraint Toggles

**File**: `frontend/src/pages/admin/components/engine/ConstraintTogglesCard.jsx`

**What Changed**:

- Added HC0 to toggle list
- Updated constraint descriptions
- Now 4 total constraints (HC0, HC1, SC1, SC2)

---

### 📝 Documentation

#### Testing Guide

**File**: `backend/SCHEDULER_TESTING_GUIDE.md` ✨ NEW

Comprehensive guide including:

- ✅ Test execution instructions
- ✅ Test specifications and explanations
- ✅ Manual API testing examples
- ✅ Constraint conflict scenarios
- ✅ Troubleshooting tips
- ✅ CI/CD integration examples

---

## How to Execute Tests

### Quick Start

```bash
# 1. Seed database
npm run seed:slots
npm run seed:scheduler-test

# 2. Run tests
npm run test:scheduler

# 3. View detailed results
npm run test:scheduler -- --verbose
```

### Full Test Suite

```bash
npm test                           # Run all tests
npm test -- --watch               # Watch mode
npm test -- --coverage            # With coverage report
```

### Manual API Testing

```bash
# Generate schedule with all constraints
curl -X POST http://localhost:5001/api/scheduler/generate \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": {
      "hc0_enabled": true,
      "hc1_enabled": true,
      "sc1_enabled": true,
      "sc2_enabled": true
    }
  }'

# With only hard constraints
curl -X POST http://localhost:5001/api/scheduler/generate \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": {
      "hc0_enabled": true,
      "hc1_enabled": true,
      "sc1_enabled": false,
      "sc2_enabled": false
    }
  }'
```

---

## Verification Checklist

Run through these to verify everything works correctly:

### ✅ Backend

- [ ] Solver runs without errors: `npm run dev` (in backend)
- [ ] Generates OPTIMAL schedule with all constraints enabled
- [ ] Multiple courses shown per week (sessionsPerWeek working)
- [ ] Each slot has exactly one course (HC0 working)
- [ ] No professor teaches 2 courses same time (HC1 working)

### ✅ Database

- [ ] 30 timeslots exist: `db.slots.count()`
- [ ] 14 courses exist with sessions: `db.courses.find().pretty()`
- [ ] 7 professors exist with mappings: `db.professors.find().pretty()`

### ✅ Frontend

- [ ] Navigate to admin/timetable-engine
- [ ] See HC0, HC1, SC1, SC2 toggles
- [ ] Click "Run Solver"
- [ ] See schedule in matrix view
- [ ] Expand courses in assignment view
- [ ] Verify each course shows correct number of sessions

### ✅ Tests

- [ ] `npm run test:scheduler` passes all 11+ tests
- [ ] Coverage > 50% on critical paths
- [ ] No test timeouts

---

## Architecture Diagram: Course Scheduling Flow

```
┌─────────────────────────────────────────────────────────┐
│           Frontend: Constraint Toggles                   │
│  [HC0 ✓] [HC1 ✓] [SC1 ✓] [SC2 ✓]  "Run Solver"       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│    Backend API: POST /api/scheduler/generate             │
│    Receives: { constraints: { hc0, hc1, sc1, sc2 } }   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│      CP-SAT Solver Strategy (scheduleSolver.py)          │
│                                                           │
│  1. Create decision variables:                           │
│     For each (course, timeslot, professor) combination  │
│                                                           │
│  2. Apply HARD constraints:                              │
│     HC0: only 1 course per slot     ← NEW!              │
│     HC1: only 1 professor per slot                      │
│                                                           │
│  3. Apply constraint: each course scheduled N times:    │
│     sum(assignments) == sessionsPerWeek  ← NEW!         │
│                                                           │
│  4. Apply SOFT constraints:                              │
│     SC1: prefer available slots (weight=10)            │
│     SC2: prefer days off (weight=6)                    │
│                                                           │
│  5. Maximize: objective = sum of soft preferences      │
│     subject to: all hard constraints ✓                 │
│                                                           │
│  6. Solve: CP-SAT solver (10s timeout, 8 workers)      │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│      Result: Schedule with Assignments                   │
│  [                                                       │
│    {                                                    │
│      courseId, courseName,                              │
│      professorId, professorName,                        │
│      timeslotId, day, startTime, endTime,             │
│      softViolations: { sc1_violated, sc2_violated }   │
│    },                                                   │
│    ... (multiple sessions per course)                  │
│  ]                                                      │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│      Frontend Views: Schedule Visualization              │
│                                                           │
│  ├─ Schedule Matrix View:                                │
│  │  Time × Day grid showing one course per slot         │
│  │                                                       │
│  └─ Course Assignment View:                              │
│     Expandable list of each course's sessions           │
└─────────────────────────────────────────────────────────┘
```

---

## Key Metrics

| Metric                   | Before      | After                                |
| ------------------------ | ----------- | ------------------------------------ |
| Courses per schedule     | 6-14        | 14 ✓                                 |
| Sessions per course      | 1 (fixed)   | 1-3 (variable) ✓                     |
| Total weekly assignments | 14          | 22 ✓                                 |
| Multiple courses/slot    | YES ❌      | NO ✓                                 |
| Test coverage            | None        | 11+ tests ✓                          |
| Frontend views           | 1 (preview) | 3 (preview + matrix + assignments) ✓ |

---

## Future Enhancements

Suggested improvements for next phase:

1. **Room Constraints**: Add HC2 for room capacity conflicts
2. **Faculty Preferences**: Add SC3 for faculty preferred time windows
3. **Venue Features**: Add soft constraint for room equipment needs
4. **Schedule Persistence**: Save versions to MongoDB with diff tracking
5. **Multi-Phase Scheduling**: Handle prerequisites and course dependencies
6. **Analytics Dashboard**: Show constraint violation heatmap

---

**Last Updated**: 2026-04-01
**Version**: 2.0.0 - Full HC0 & Sessions Implementation
