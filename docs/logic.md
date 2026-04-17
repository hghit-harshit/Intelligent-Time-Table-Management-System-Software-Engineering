# Timetable Generation Flow

## Overview
The timetable generation system uses constraint-based scheduling with Google OR-Tools CP-SAT solver to generate conflict-free schedules.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Express API │────▶│   Solver    │────▶│  MongoDB    │
│  (React)    │     │  (Node.js)   │     │ (Python)    │     │             │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                         │                      │
                         ▼                      ▼
                  ┌──────────────┐     ┌─────────────────┐
                  │  Scheduler   │     │  scheduleSolver │
                  │  Service     │     │      .py        │
                  └──────────────┘     └─────────────────┘
```

## Data Flow

### 1. Input Data (from MongoDB)
- **Slots**: Time slots (Mon-Fri, various times)
- **Courses**: Course details (code, name, department, students count)
- **Professors**: Faculty info with course mappings
- **Rooms**: Classrooms with capacity and department
- **BatchCourseRequirements**: Which courses are required for which batches

### 2. API Call
```
POST /api/scheduler/generate
Body: { constraints: { hc1_enabled: true, hc2_enabled: true, ... } }
```

### 3. Scheduler Service (`scheduler.service.ts`)
- Fetches all data from MongoDB via `schedulerRepository`
- Passes data to Python solver via `solverBridge`
- Receives assignments (slot + course + professor mappings)
- Detects conflicts (faculty double-booking, room double-booking)
- Saves result to `TimetableResult` collection

### 4. Solver Bridge (`solverBridge.ts`)
- Spawns Python process with `scheduleSolver.py`
- Sends JSON payload via stdin
- Reads JSON result from stdout
- Returns assignments array

### 5. Python Solver (`scheduleSolver.py`)
Uses OR-Tools CP-SAT with these constraints:
- **HC1**: No professor teaches two courses at same time
- **HC2**: No room is double-booked  
- **HC3**: Courses assigned to valid slots
- **SC1**: Professor unavailable slots respected
- **SC2**: Professor preferred days off respected

### 6. Output
```json
{
  "success": true,
  "version": "v1234567890",
  "assignments": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "09:55",
      "courseCode": "CSE101",
      "courseName": "Programming Fundamentals",
      "professorName": "Dr. Arun Kumar",
      "roomName": "CSE-LH101",
      "batchId": "CS-FY"
    }
  ],
  "conflicts": [],
  "stats": { ... }
}
```

## Database Collections

### students (via User model with role="student")
- `firstName`, `lastName`, `email`, `role: "student"`

### student_enrollments
- `studentId` (ref to User)
- `batchId` (e.g., "CS-FY")
- `enrolledCourseIds` (array of Course _ids)
- `academicYear`, `semester`

### courses
- `code` (e.g., "CSE101")
- `name`
- `department`
- `batchIds`
- `professorIds`
- `students` (count)

### professors
- `name`
- `courseMappings` (Course _ids)
- `availability` (unavailable slots)

### rooms
- `name`
- `capacity`
- `department`

### slots
- `label` (e.g., "Slot A")
- `occurrences[]` (day, startTime, endTime)

### timetable_results
- `version`
- `status` ("draft" | "published")
- `assignments[]`
- `conflicts[]`
- `stats`
- `constraints`

## Conflict Detection

After solver runs, `detectConflicts()` scans assignments for:
- **Faculty conflicts**: Same professor in same time slot
- **Room conflicts**: Same room double-booked

## Seed Scripts

Run in order:
1. `npm run seed:slots:inside` - Creates time slots
2. `npm run seed:scheduler-test:inside` - Creates courses, professors, rooms
3. `npm run seed:students:inside` - Creates 30 students with enrollments