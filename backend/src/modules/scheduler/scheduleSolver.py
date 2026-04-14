#!/usr/bin/env python3
import json
import sys
from typing import Dict, List, Tuple

try:
    from ortools.sat.python import cp_model
except Exception as error:  # pragma: no cover
    print(
        json.dumps(
            {
                "success": False,
                "message": "Python package 'ortools' is not installed.",
                "diagnostics": {"importError": str(error)},
            }
        )
    )
    sys.exit(1)


def value_from(doc: dict, keys: List[str], default=None):
    for key in keys:
        if key in doc and doc[key] is not None:
            return doc[key]
    return default


def stringify_id(value):
    if value is None:
        return ""
    return str(value)


def normalize_day(value):
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    return text[0].upper() + text[1:].lower()


class TimetableCpSatBuilder:
    def __init__(self, payload: dict):
        self.payload = payload
        self.constraints = payload.get("constraints", {})
        self.model = cp_model.CpModel()

        self.slots = self.normalize_slot_units(payload)
        self.occurrence_count = sum(
            len(slot.get("occurrences", [])) for slot in self.slots
        )
        self.courses = payload.get("courses", [])
        self.professors = payload.get("professors", [])

        self.slot_by_id = {stringify_id(slot.get("_id")): slot for slot in self.slots}
        self.occurrence_by_id = {}
        for slot in self.slots:
            slot_id = stringify_id(slot.get("_id"))
            for occurrence in slot.get("occurrences", []):
                occurrence_id = stringify_id(occurrence.get("_id"))
                if occurrence_id:
                    self.occurrence_by_id[occurrence_id] = {
                        "slotId": slot_id,
                        "day": occurrence.get("day"),
                        "startTime": occurrence.get("startTime"),
                        "endTime": occurrence.get("endTime"),
                    }

        self.professor_by_id = {stringify_id(prof.get("_id")): prof for prof in self.professors}

        self.assignment_vars: Dict[Tuple[int, int, int], cp_model.IntVar] = {}
        self.assignment_meta: Dict[Tuple[int, int, int], dict] = {}
        self.unschedulable_courses = []

        self.soft_reward_terms = []
        self.applied_constraints = []

        self.hard_constraints_registry = {
            "hc1_enabled": self.apply_hc1_one_class_per_professor_per_slot,
        }
        self.soft_constraints_registry = {
            "sc1_enabled": self.apply_sc1_unavailable_slots_preference,
            "sc2_enabled": self.apply_sc2_preferred_day_off_preference,
        }

    def normalize_slot_units(self, payload):
        slots = payload.get("slots", []) or []
        if slots:
            normalized = []
            for slot in slots:
                occurrences = []
                for occurrence in slot.get("occurrences", []) or []:
                    occurrences.append(
                        {
                            "_id": occurrence.get("_id"),
                            "day": occurrence.get("day"),
                            "startTime": occurrence.get("startTime"),
                            "endTime": occurrence.get("endTime"),
                        }
                    )

                normalized.append(
                    {
                        "_id": slot.get("_id"),
                        "label": slot.get("label"),
                        "occurrences": occurrences,
                    }
                )
            return normalized

        grouped = {}
        for timeslot in payload.get("timeslots", []) or []:
            parent_slot_id = stringify_id(
                value_from(timeslot, ["slotId", "originalSlotId", "_id"])
            )
            if not parent_slot_id:
                parent_slot_id = f"slot::{value_from(timeslot, ['label'], 'Unlabeled')}"

            if parent_slot_id not in grouped:
                grouped[parent_slot_id] = {
                    "_id": parent_slot_id,
                    "label": value_from(timeslot, ["label", "originalLabel"], ""),
                    "occurrences": [],
                }

            grouped[parent_slot_id]["occurrences"].append(
                {
                    "_id": timeslot.get("_id"),
                    "day": timeslot.get("day"),
                    "startTime": timeslot.get("startTime"),
                    "endTime": timeslot.get("endTime"),
                }
            )

        return list(grouped.values())

    def build(self):
        self.create_decision_variables()
        self.apply_core_constraints()
        self.apply_dynamic_constraints()
        self.apply_objective()

    def get_course_name(self, course):
        return value_from(course, ["name", "title", "courseName", "code"], "Unnamed Course")

    def get_professor_name(self, professor):
        return value_from(professor, ["name", "facultyName", "fullName", "email"], "Unknown Faculty")

    def occurrence_key(self, occurrence):
        return (
            f"{normalize_day(occurrence.get('day'))}|"
            f"{occurrence.get('startTime', '')}|"
            f"{occurrence.get('endTime', '')}"
        )

    def occurrences_conflict(self, left, right):
        if normalize_day(left.get("day")) != normalize_day(right.get("day")):
            return False

        left_start = left.get("startTime", "")
        left_end = left.get("endTime", "")
        right_start = right.get("startTime", "")
        right_end = right.get("endTime", "")

        if not left_start or not left_end or not right_start or not right_end:
            return False

        left_start_minutes = self.time_to_minutes(left_start)
        left_end_minutes = self.time_to_minutes(left_end)
        right_start_minutes = self.time_to_minutes(right_start)
        right_end_minutes = self.time_to_minutes(right_end)

        return left_start_minutes < right_end_minutes and right_start_minutes < left_end_minutes

    def slots_conflict(self, left_slot, right_slot):
        for left_occurrence in left_slot.get("occurrences", []):
            for right_occurrence in right_slot.get("occurrences", []):
                if self.occurrences_conflict(left_occurrence, right_occurrence):
                    return True
        return False

    def time_to_minutes(self, time_text):
        hours, minutes = str(time_text).split(":")
        return int(hours) * 60 + int(minutes)

    def extract_professor_course_ids(self, professor):
        mappings = value_from(
            professor,
            ["courseMappings", "courseIds", "courses", "mappedCourses", "teachableCourses"],
            [],
        )
        result = set()
        for item in mappings or []:
            if isinstance(item, dict):
                maybe_id = value_from(item, ["courseId", "_id", "id"])
                if maybe_id:
                    result.add(stringify_id(maybe_id))
            else:
                result.add(stringify_id(item))
        return result

    def extract_course_professor_ids(self, course):
        raw_ids = value_from(
            course,
            ["professorIds", "facultyIds", "teacherIds", "instructorIds", "assignedProfessorIds"],
            [],
        )
        return {stringify_id(value) for value in raw_ids or [] if value is not None}

    def eligible_professor_indices_for_course(self, course):
        explicit_ids = self.extract_course_professor_ids(course)
        course_id = stringify_id(course.get("_id"))

        eligible = []
        for index, professor in enumerate(self.professors):
            professor_id = stringify_id(professor.get("_id"))
            teaches_course = course_id in self.extract_professor_course_ids(professor)

            if explicit_ids:
                if professor_id in explicit_ids:
                    eligible.append(index)
            else:
                if teaches_course:
                    eligible.append(index)

        if eligible:
            return eligible

        return list(range(len(self.professors)))

    def create_decision_variables(self):
        for course_index, course in enumerate(self.courses):
            course_name = self.get_course_name(course)
            eligible_prof_indices = self.eligible_professor_indices_for_course(course)

            for slot_index, slot in enumerate(self.slots):
                slot_id = stringify_id(slot.get("_id"))
                for prof_index in eligible_prof_indices:
                    professor = self.professors[prof_index]
                    professor_name = self.get_professor_name(professor)

                    blocked_reference = self.extract_blocked_reference(professor)
                    if self.slot_has_any_blocked_occurrence(slot, blocked_reference):
                        continue

                    var_key = (course_index, slot_index, prof_index)
                    var = self.model.NewBoolVar(
                        f"x_c{course_index}_s{slot_index}_p{prof_index}"
                    )
                    self.assignment_vars[var_key] = var
                    self.assignment_meta[var_key] = {
                        "courseName": course_name,
                        "slotId": slot_id,
                        "professorName": professor_name,
                    }

    def apply_core_constraints(self):
        for course_index, course in enumerate(self.courses):
            candidates = [
                var
                for (c_idx, _t_idx, _p_idx), var in self.assignment_vars.items()
                if c_idx == course_index
            ]

            if not candidates:
                self.unschedulable_courses.append(
                    {
                        "courseId": stringify_id(course.get("_id")),
                        "courseName": self.get_course_name(course),
                    }
                )
                continue

            # Each course assigned to exactly one slot
            self.model.Add(sum(candidates) == 1)

    def apply_dynamic_constraints(self):
        for flag_key, handler in self.hard_constraints_registry.items():
            enabled = self.constraints.get(flag_key, True)
            if enabled:
                handler()
                self.applied_constraints.append({"id": flag_key, "type": "hard", "enabled": True})
            else:
                self.applied_constraints.append({"id": flag_key, "type": "hard", "enabled": False})

        for flag_key, handler in self.soft_constraints_registry.items():
            enabled = self.constraints.get(flag_key, True)
            if enabled:
                handler()
                self.applied_constraints.append({"id": flag_key, "type": "soft", "enabled": True})
            else:
                self.applied_constraints.append({"id": flag_key, "type": "soft", "enabled": False})

    def extract_blocked_reference(self, professor):
        availability = value_from(professor, ["availability"], {}) or {}
        blocked_candidates = []

        blocked_candidates.extend(
            value_from(professor, ["unavailableSlotIds", "blockedSlotIds"], []) or []
        )
        blocked_candidates.extend(
            value_from(availability, ["unavailableSlotIds", "blockedSlotIds"], []) or []
        )

        blocked_ids = {stringify_id(item) for item in blocked_candidates if item is not None}

        blocked_slots = value_from(professor, ["blockedSlots", "unavailableSlots"], []) or []
        blocked_slots.extend(value_from(availability, ["blockedSlots", "unavailableSlots"], []) or [])

        blocked_slot_keys = set()
        for item in blocked_slots:
            if isinstance(item, str):
                blocked_ids.add(stringify_id(item))
            elif isinstance(item, dict):
                maybe_id = value_from(item, ["slotId", "_id", "id"])
                if maybe_id:
                    blocked_ids.add(stringify_id(maybe_id))
                    continue
                blocked_slot_keys.add(self.occurrence_key(item))

        return {
            "ids": blocked_ids,
            "keys": blocked_slot_keys,
        }

    def slot_has_any_blocked_occurrence(self, slot, blocked_reference):
        slot_id = stringify_id(slot.get("_id"))
        if slot_id in blocked_reference["ids"]:
            return True

        for occurrence in slot.get("occurrences", []):
            occurrence_id = stringify_id(occurrence.get("_id"))
            if occurrence_id and occurrence_id in blocked_reference["ids"]:
                return True

            if self.occurrence_key(occurrence) in blocked_reference["keys"]:
                return True

        return False

    def apply_hc1_one_class_per_professor_per_slot(self):
        for prof_index, _prof in enumerate(self.professors):
            vars_per_slot = {}
            for slot_index, _slot in enumerate(self.slots):
                vars_per_slot[slot_index] = [
                    var
                    for (c_idx, t_idx, p_idx), var in self.assignment_vars.items()
                    if t_idx == slot_index and p_idx == prof_index
                ]

                if vars_per_slot[slot_index]:
                    self.model.Add(sum(vars_per_slot[slot_index]) <= 1)

            for left_slot_index in range(len(self.slots)):
                left_vars = vars_per_slot.get(left_slot_index, [])
                if not left_vars:
                    continue

                for right_slot_index in range(left_slot_index + 1, len(self.slots)):
                    right_vars = vars_per_slot.get(right_slot_index, [])
                    if not right_vars:
                        continue

                    if not self.slots_conflict(
                        self.slots[left_slot_index],
                        self.slots[right_slot_index],
                    ):
                        continue

                    self.model.Add(sum(left_vars) + sum(right_vars) <= 1)

    def apply_sc1_unavailable_slots_preference(self):
        weight = 10
        for prof_index, professor in enumerate(self.professors):
            blocked_reference = self.extract_blocked_reference(professor)
            for (c_idx, t_idx, p_idx), var in self.assignment_vars.items():
                if p_idx != prof_index:
                    continue
                slot = self.slots[t_idx]
                if not self.slot_has_any_blocked_occurrence(slot, blocked_reference):
                    self.soft_reward_terms.append(weight * var)

    def extract_preferred_days_off(self, professor):
        preferences = value_from(professor, ["preferences"], {}) or {}
        values = value_from(
            professor,
            ["preferredDaysOff", "daysOff", "noClassDays"],
            [],
        ) or []
        values += value_from(preferences, ["preferredDaysOff", "daysOff", "noClassDays"], []) or []
        return {normalize_day(day) for day in values if day}

    def apply_sc2_preferred_day_off_preference(self):
        weight = 6
        for prof_index, professor in enumerate(self.professors):
            days_off = self.extract_preferred_days_off(professor)
            for (_c_idx, t_idx, p_idx), var in self.assignment_vars.items():
                if p_idx != prof_index:
                    continue
                slot = self.slots[t_idx]
                slot_days = {
                    normalize_day(occurrence.get("day"))
                    for occurrence in slot.get("occurrences", [])
                    if occurrence.get("day")
                }
                if not slot_days.intersection(days_off):
                    self.soft_reward_terms.append(weight * var)

    def apply_objective(self):
        if self.soft_reward_terms:
            self.model.Maximize(sum(self.soft_reward_terms))

    def solve(self):
        if self.unschedulable_courses:
            return {
                "success": False,
                "message": "Some courses have no valid (slot, professor) options.",
                "diagnostics": {
                    "unschedulableCourses": self.unschedulable_courses,
                    "appliedConstraints": self.applied_constraints,
                },
            }

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 10.0
        solver.parameters.num_search_workers = 8

        status = solver.Solve(self.model)

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return {
                "success": False,
                "message": "No feasible schedule found for current constraints.",
                "diagnostics": {
                    "status": int(status),
                    "appliedConstraints": self.applied_constraints,
                },
            }

        assignments = []
        for (course_index, slot_index, prof_index), var in self.assignment_vars.items():
            if solver.Value(var) != 1:
                continue

            course = self.courses[course_index]
            slot = self.slots[slot_index]
            professor = self.professors[prof_index]

            blocked_reference = self.extract_blocked_reference(professor)
            preferred_days_off = self.extract_preferred_days_off(professor)

            for occurrence in slot.get("occurrences", []):
                slot_day = normalize_day(occurrence.get("day"))
                occurrence_id = stringify_id(occurrence.get("_id"))
                occurrence_is_blocked = (
                    (occurrence_id and occurrence_id in blocked_reference["ids"])
                    or self.occurrence_key(occurrence) in blocked_reference["keys"]
                    or stringify_id(slot.get("_id")) in blocked_reference["ids"]
                )

                assignments.append(
                    {
                        "courseId": stringify_id(course.get("_id")),
                        "courseName": self.get_course_name(course),
                        "courseCode": course.get("code", ""),
                        "students": course.get("students", 0),
                        "professorId": stringify_id(professor.get("_id")),
                        "professorName": self.get_professor_name(professor),
                        "slotId": stringify_id(slot.get("_id")),
                        "slotLabel": value_from(slot, ["label"], ""),
                        "timeslotId": occurrence_id,
                        "timeslotLabel": value_from(slot, ["label"], ""),
                        "day": slot_day,
                        "startTime": value_from(occurrence, ["startTime"], ""),
                        "endTime": value_from(occurrence, ["endTime"], ""),
                        "softViolations": {
                            "sc1_unavailable_slot_violated": occurrence_is_blocked,
                            "sc2_preferred_day_off_violated": slot_day in preferred_days_off,
                        },
                    }
                )

        return {
            "success": True,
            "assignments": assignments,
            "stats": {
                "courseCount": len(self.courses),
                "slotCount": len(self.slots),
                "timeslotCount": self.occurrence_count,
                "professorCount": len(self.professors),
                "objectiveValue": solver.ObjectiveValue() if self.soft_reward_terms else None,
                "appliedConstraints": self.applied_constraints,
                "solverStatus": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
            },
        }


def main():
    raw = sys.stdin.read()
    payload = json.loads(raw or "{}")

    builder = TimetableCpSatBuilder(payload)
    builder.build()
    result = builder.solve()

    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # pragma: no cover
        print(
            json.dumps(
                {
                    "success": False,
                    "message": "Unhandled solver error",
                    "diagnostics": {"error": str(error)},
                }
            )
        )
        sys.exit(1)
