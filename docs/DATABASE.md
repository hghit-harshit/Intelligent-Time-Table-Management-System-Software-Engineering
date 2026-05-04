# Timetable Engine Dummy Data

This document describes all the data stored in the backend for the Timetable Engine.

## Database Models

### 1. Slots (`SlotModel`)
Time slots representing when classes can be scheduled.

**Seeded via:** `npm run seed:slots`

The seed creates slots for each day of the week (Monday-Friday) with time windows:
- 09:00-10:30
- 10:45-12:15
- 13:00-14:30
- 14:45-16:15
- 16:30-18:00

Each slot has multiple `occurrences` - one for each day of the week with specific start/end times.

### 2. Courses (`CourseModel`)
Courses that need to be scheduled.

**Seeded via:** `npm run seed:scheduler-test:inside`

The dummy data includes 15 courses across departments:

| Code | Name | Students | Department |
|------|------|----------|------------|
| CSE101 | Programming Fundamentals | 120 | CSE |
| CSE201 | Data Structures | 95 | CSE |
| CSE303 | Database Systems | 56 | CSE |
| CSE401 | Operating Systems | 78 | CSE |
| CSE305 | Computer Networks | 92 | CSE |
| CSE307 | Software Engineering | 110 | CSE |
| CSE411 | Machine Learning | 65 | CSE |
| MAT201 | Discrete Mathematics | 85 | MATH |
| MAT301 | Probability and Statistics | 88 | MATH |
| ECE205 | Digital Logic Design | 70 | ECE |
| EEE220 | Signals and Systems | 75 | EEE |
| PHY210 | Applied Physics | 100 | PHY |
| HUM101 | Technical Communication | 140 | HUM |
| MGT201 | Engineering Economics | 130 | MGT |

### 3. Professors (`ProfessorModel`)
Faculty members who teach courses.

**Seeded via:** `npm run seed:scheduler-test:inside`

7 professors with their courses, preferred days off, and blocked slots:

| Name | Teaches | Preferred Days Off | Blocked Slots |
|------|---------|-------------------|---------------|
| Dr. Arun Kumar | CSE101, CSE201 | Friday | Mon 09:00, Wed 16:00 |
| Prof. Meera Nair | MAT201, ECE205 | Wednesday | Tue 12:00, Thu 10:00 |
| Dr. Sanjay Iyer | CSE303, CSE401 | Monday | Fri 14:30, Tue 09:00 |
| Dr. Priya Raman | CSE305, CSE307 | Thursday | Mon 14:30, Fri 10:00 |
| Prof. Nikhil Verma | CSE411, MAT301 | Tuesday | Wed 09:00, Thu 16:00 |
| Dr. Kavya Menon | PHY210, EEE220 | Friday | Tue 11:00, Mon 16:00 |
| Prof. Rahul Sharma | HUM101, MGT201 | Wednesday | Thu 12:00, Fri 09:00 |

### 4. Rooms (`RoomModel`)
Physical spaces where classes are held.

**Seeded via:** `npm run seed:scheduler-test:inside`

16 rooms with varying capacities:

| Name | Capacity | Department | Building |
|------|----------|------------|----------|
| CSE-LH101 | 150 | CSE | CSE Block |
| CSE-LH102 | 140 | CSE | CSE Block |
| CSE-LH103 | 120 | CSE | CSE Block |
| CSE-LH104 | 110 | CSE | CSE Block |
| ECE-LH201 | 95 | ECE | ECE Block |
| ECE-LH202 | 85 | ECE | ECE Block |
| MATH-CR301 | 90 | MATH | Science Block |
| MATH-CR302 | 70 | MATH | Science Block |
| PHY-CR303 | 110 | PHY | Science Block |
| EEE-CR304 | 80 | EEE | EEE Block |
| HUM-SR401 | 150 | HUM | Humanities Block |
| MGT-SR402 | 140 | MGT | Management Block |
| CSE-SR501 | 65 | CSE | CSE Block |
| ECE-SR502 | 60 | ECE | ECE Block |
| MATH-SR503 | 50 | MATH | Science Block |
| EEE-SR504 | 45 | EEE | EEE Block |

### 5. Batch Course Requirements (`BatchCourseRequirementModel`)
Specifies which batches (year/groups) require which courses.

**Seeded via:** `npm run seed:scheduler-test:inside`

Batch IDs used:
- CS-FY (CSE First Year)
- CS-SY (CSE Second Year)
- CS-TY (CSE Third Year)
- EE-FY (ECE First Year)
- EE-SY (ECE Second Year)
- EE-TY (ECE Third Year)

Each course is marked as `compulsory` for specific batches.

---

## Solver Constraints

### Hard Constraints (Must Satisfy)

1. **HC1: One class per professor per slot** - A professor cannot teach two different courses at the same time slot.

2. **HC2: Department room capacity** - A room must have sufficient capacity for the number of students in the assigned course.

3. **HC3: No compulsory slot clash per batch** - Students in a batch cannot have two compulsory courses at the same time.

### Soft Constraints (Preferences - minimize violations)

1. **SC1: Unavailable slots preference** - Professors should not be assigned to their blocked time slots.

2. **SC2: Preferred day off** - Professors should have their preferred day off.

---

## How the Solver Works

1. **Data Collection**: Backend fetches all courses, professors, rooms, and slot occurrences from MongoDB.

2. **CP-SAT Solver**: Python OR-Tools constraint solver runs the optimization:
   - Input: All courses, professors, rooms, slots, and constraint flags
   - Output: Optimal assignments that satisfy hard constraints

3. **Classroom Assignment**: Greedy algorithm assigns rooms after slot assignment:
   - First tries department-specific rooms
   - Falls back to common lecture halls if needed

4. **Results**: Returns assignments with course, professor, day, time, and room info.

---

## Running the Seeds

```bash
# 1. Seed time slots (required first)
cd backend
npm run seed:slots:inside

# 2. Seed scheduler test data (courses, professors, rooms)
npm run seed:scheduler-test:inside

# OR do both at once
npm run seed:all:inside
```