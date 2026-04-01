# CP-SAT Scheduler Testing Guide

## Overview

This document provides comprehensive instructions for testing the CP-SAT-based timetable scheduler implementation. The scheduler uses Google OR-Tools' CP-SAT solver to generate conflict-free, constraint-respecting timetables.

## Test Execution

### Prerequisites

1. **MongoDB Running**: Ensure MongoDB is accessible and populated with test data:

   ```bash
   npm run seed:slots
   npm run seed:scheduler-test
   ```

2. **Python 3 Installed**: The solver runs as a subprocess:

   ```bash
   python3 --version
   pip3 install -r requirements.txt
   ```

3. **Dependencies Installed**:
   ```bash
   npm install
   ```

### Running the Test Suite

#### Full Test Suite

```bash
npm test
```

#### Scheduler Tests Only (Recommended)

```bash
npm run test:scheduler
```

#### With Verbose Output

```bash
npm run test:scheduler -- --verbose
```

#### Watch Mode (Auto-rerun on changes)

```bash
npm test -- --watch
```

#### With Coverage Report

```bash
npm test -- --coverage
```

## Test Specifications

### Test Categories

#### 1. HC1: One Course Per Timeslot

- **Test**: `should not schedule multiple courses in the same slot`
  - Validates that only ONE course occupies any timeslot (hard constraint HC0)
  - Fails if multiple courses appear in identical {day, startTime, endTime}

- **Test**: `should not schedule multiple courses for the same professor in one slot`
  - Validates that a professor teaches at most one class per slot (hard constraint HC1)
  - Fails if a professor has multiple assignments in the same slot

#### 2. SC1: Respect Unavailable Slots

- **Test**: `should respect blocked slots when constraint is enabled`
  - Validates that courses avoid professor's blocked timeslots
  - Allows up to 10% violations (soft constraint)

- **Test**: `should relax SC1 when disabled`
  - Confirms that disabling SC1 still produces valid schedules (just less preferred)

#### 3. SC2: Respect Preferred Days Off

- **Test**: `should maximize adherence to preferred days off`
  - Validates that professors are scheduled off on preferred days when possible
  - Allows up to 15% violations (soft constraint)

#### 4. Output Validation

- **Test**: `should generate valid assignment structure`
  - Validates each assignment has required fields:
    - `courseId`, `courseName`
    - `professorId`, `professorName`
    - `timeslotId`, `day`, `startTime`, `endTime`
    - `softViolations` (object)

- **Test**: `should return stats with expected fields`
  - Validates response metadata:
    - `courseCount`, `timeslotCount`, `professorCount`
    - `solverStatus` (OPTIMAL or FEASIBLE)
    - `appliedConstraints` (array of constraint states)

#### 5. Feasibility

- **Test**: `should find feasible solution with all constraints enabled`
  - Validates that the solver finds a solution when constraints are consistent

- **Test**: `should fail gracefully when no feasible solution exists`
  - Validates error handling when an impossible course exists (no professors)

#### 6. Sessions Per Week Distribution

- **Test**: `should schedule courses multiple times if sessionsPerWeek > 1`
  - Validates that courses with `sessionsPerWeek: 2` or `3` are scheduled multiple times
  - Currently observational; can be made strict by checking course counts

## Manual Testing

### Test the API Directly

1. **Start the backend server**:

   ```bash
   npm run dev
   ```

2. **With all constraints enabled** (default):

   ```bash
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
   ```

3. **With only hard constraints**:

   ```bash
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

4. **With HC1 disabled** (should see multiple courses per slot):
   ```bash
   curl -X POST http://localhost:5001/api/scheduler/generate \
     -H "Content-Type: application/json" \
     -d '{
       "constraints": {
         "hc0_enabled": true,
         "hc1_enabled": false,
         "sc1_enabled": true,
         "sc2_enabled": true
       }
     }'
   ```

### Inspect Response Structure

Expected successful response:

```json
{
  "success": true,
  "assignments": [
    {
      "courseId": "...",
      "courseName": "Programming Fundamentals",
      "professorId": "...",
      "professorName": "Dr. Arun Kumar",
      "timeslotId": "...",
      "timeslotLabel": "Mon 09:00-10:30",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "softViolations": {
        "sc1_unavailable_slot_violated": false,
        "sc2_preferred_day_off_violated": false
      }
    },
    ...
  ],
  "stats": {
    "courseCount": 14,
    "timeslotCount": 30,
    "professorCount": 7,
    "objectiveValue": 224,
    "appliedConstraints": [
      { "id": "hc0_enabled", "type": "hard", "enabled": true },
      { "id": "hc1_enabled", "type": "hard", "enabled": true },
      { "id": "sc1_enabled", "type": "soft", "enabled": true },
      { "id": "sc2_enabled", "type": "soft", "enabled": true }
    ],
    "solverStatus": "OPTIMAL"
  }
}
```

## Constraint Explanations

### HC0: One Course Per Slot (Hard)

- **Rule**: Each timeslot can have at most ONE course scheduled
- **Why**: Prevents scheduling multiple courses in the same physical classroom/time
- **Penalty for violation**: Infeasible solution (solver cannot proceed)

### HC1: One Class Per Professor Per Slot (Hard)

- **Rule**: Each professor teaches at most one course per timeslot
- **Why**: A professor cannot teach two courses simultaneously
- **Penalty for violation**: Infeasible solution

### SC1: Respect Unavailable Slots (Soft)

- **Rule**: Prefer to schedule courses in slots where the professor is available
- **Weight**: 10 (high priority if soft constraint enabled)
- **Why**: Honor professor's blocked times (meetings, other commitments)
- **Penalty for violation**: Contribution to objective function (minimized)

### SC2: Respect Preferred Days Off (Soft)

- **Rule**: Prefer to schedule courses on days when professor is working
- **Weight**: 6 (medium priority)
- **Why**: Allow professors to have preferred non-teaching days
- **Penalty for violation**: Contribution to objective function

## Troubleshooting

### Test Fails: "spawn python3 ENOENT"

**Solution**: Ensure Python 3 is in PATH:

```bash
which python3
# Should output: /usr/bin/python3 (or similar)
```

### Test Fails: "No slots found"

**Solution**: Seed the database first:

```bash
npm run seed:slots
npm run seed:scheduler-test
```

### Test Hangs

**Solution**: Solver has a 10-second timeout. If tests hang, check:

1. MongoDB connection (ensure it's running)
2. Python subprocess (check if ortools is installed)

### Tests Pass But Solver Returns FEASIBLE (Not OPTIMAL)

This is acceptable and happens when:

- Constraints are very tight
- 10-second timeout is reached before optimality proven
- Solver found a valid solution but couldn't prove it's best

## Performance Notes

- **Expected test duration**: 30–60 seconds (depends on machine and MongoDB latency)
- **Solver timeout**: 10 seconds per generation (adjustable in `scheduleSolver.py`)
- **Workload**: 14 courses × 7 professors × 30 timeslots = typical test case

## Frontend Testing

Once tests pass and the API is working:

1. **Open admin dashboard**:

   ```
   http://localhost:5173/admin/timetable-engine
   ```

2. **Click "Run Solver"** to generate a schedule

3. **Verify new schedule views**:
   - **Schedule Matrix**: Time-slot × Day grid showing which course is in which slot
   - **Course Assignment**: Expandable list showing each course's assigned sessions

## Adding New Tests

To add a new test constraint (e.g., HC2):

1. Add constraint handler in `scheduleSolver.py`:

   ```python
   def apply_hc2_no_consecutive_slots(self):
     # Implementation...
   ```

2. Register in constraint registry:

   ```python
   self.hard_constraints_registry["hc2_enabled"] = self.apply_hc2_no_consecutive_slots
   ```

3. Add test in `__tests__/scheduleSolver.test.js`:
   ```javascript
   describe("HC2: No Consecutive Slots", () => {
     it("should not schedule same course in consecutive slots", async () => {
       // Test implementation...
     });
   });
   ```

## Constraint Conflict Scenarios

### Scenario 1: Infeasible

```
- 3 courses with 2 sessions each = 6 total assignments
- 2 professors available
- 5 timeslots total
- Result: INFEASIBLE (not enough slots/professors)
```

### Scenario 2: Hard Conflicts

```
- Professor blocked on Monday & Friday
- 3 courses assigned to professor with 2 sessions each
- Only 20 available slots (Wed-Thu-Fri morning)
- Result: May be FEASIBLE but tight
```

### Scenario 3: Soft Conflicts

```
- All courses fit with hard constraints
- Professor prefers no Thursday classes
- Planner assigned 2 Thursday slots to this professor
- Result: FEASIBLE but 2 SC2 violations
```

## CI/CD Integration

For GitHub Actions or similar:

```yaml
- name: Install dependencies
  run: npm install

- name: Seed test data
  run: npm run seed:scheduler-test

- name: Run tests
  run: npm run test:scheduler

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

**Last Updated**: 2026-01-04
**Version**: 1.0.0
