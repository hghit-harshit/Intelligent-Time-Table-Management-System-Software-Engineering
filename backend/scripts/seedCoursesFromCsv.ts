import fs from "node:fs/promises";
import path from "node:path";

import { connectDatabase, disconnectDatabase } from "../src/database/index.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { DepartmentModel } from "../src/database/models/departmentModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";

type CsvRow = string[];

type Occurrence = {
  day: string;
  startTime: string;
  endTime: string;
};

const CSV_HEADERS = {
  department: "Department",
  courseCode: "Course Code",
  courseName: "Course Name",
  credits: "Credits",
  coordinatorName: "Coordinator Name",
  instructorName: "Instructor name",
  segmentName: "Segment Name",
  courseSlotCode: "Course Slot Code",
  classTimings: "Class Timings",
  roomNo: "Room No.",
} as const;

const parseCsv = (text: string): CsvRow[] => {
  const rows: CsvRow[] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(value);
      value = "";
      if (row.some((item) => item.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((item) => item.trim() !== "")) {
    rows.push(row);
  }

  return rows;
};

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

const buildDepartmentCode = (name: string) => {
  const normalized = normalizeText(name).toUpperCase();
  const code = normalized.replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return code || "DEPARTMENT";
};

const normalizeTime = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return "";
  }
  const hours = match[1].padStart(2, "0");
  return `${hours}:${match[2]}`;
};

const parseClassTimings = (value: string) => {
  const occurrences: Occurrence[] = [];
  const pattern =
    /(Monday|Tuesday|Wednesday|Thursday|Friday)\s*[- ]\s*(\d{1,2}:\d{2})\s*(?:-|to)\s*(\d{1,2}:\d{2})/gi;
  let match = pattern.exec(value);

  while (match) {
    const day = match[1];
    const startTime = normalizeTime(match[2]);
    const endTime = normalizeTime(match[3]);

    if (startTime && endTime) {
      occurrences.push({ day, startTime, endTime });
    }

    match = pattern.exec(value);
  }

  return occurrences;
};

const splitProfessorNames = (value: string) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  const banned = new Set([
    "UNSPECIFIED",
    "NPTEL COURSE",
    "NO ROOM REQUIRED",
    "LECTURE",
    "THESIS",
    "PROJECT",
    "INTERNSHIP",
  ]);

  return normalized
    .split(/,|&|\sand\s/gi)
    .map((part) => normalizeText(part))
    .filter((part) => part && !banned.has(part.toUpperCase()));
};

const getField = (row: CsvRow, indexMap: Map<string, number>, name: string) => {
  const index = indexMap.get(name);
  if (index === undefined) {
    return "";
  }
  return row[index] ?? "";
};

const run = async () => {
  const csvPath = process.argv[2] ?? process.env.COURSES_CSV_PATH;
  if (!csvPath) {
    throw new Error(
      "Missing CSV path. Provide it as an argument or set COURSES_CSV_PATH.",
    );
  }

  const sourceTag = process.env.COURSE_SEED_SOURCE ?? "csv-jan26-apr26";

  await connectDatabase();
  console.log("Connected to database (course seed)");

  const absolutePath = path.resolve(csvPath);
  const fileContents = await fs.readFile(absolutePath, "utf8");
  const rows = parseCsv(fileContents);
  if (rows.length < 2) {
    throw new Error("CSV file contains no data rows.");
  }

  const headerRow = rows[0].map((value) => value.replace(/^\ufeff/, "").trim());
  const indexMap = new Map<string, number>();
  headerRow.forEach((header, index) => {
    indexMap.set(header, index);
  });

  const dataRows = rows.slice(1);

  const departmentNames = new Set<string>();
  const professorNames = new Set<string>();

  for (const row of dataRows) {
    const dept = normalizeText(getField(row, indexMap, CSV_HEADERS.department));
    if (dept) {
      departmentNames.add(dept);
    }

    const coordinator = getField(row, indexMap, CSV_HEADERS.coordinatorName);
    const instructor = getField(row, indexMap, CSV_HEADERS.instructorName);

    for (const name of splitProfessorNames(coordinator)) {
      professorNames.add(name);
    }
    for (const name of splitProfessorNames(instructor)) {
      professorNames.add(name);
    }
  }

  if (departmentNames.size) {
    const departmentOps = Array.from(departmentNames).map((name) => ({
      updateOne: {
        filter: { name },
        update: {
          $setOnInsert: {
            name,
            code: buildDepartmentCode(name),
          },
        },
        upsert: true,
      },
    }));

    await DepartmentModel.bulkWrite(departmentOps, { ordered: false });
  }

  if (professorNames.size) {
    const professorOps = Array.from(professorNames).map((name) => ({
      updateOne: {
        filter: { name },
        update: { $setOnInsert: { name } },
        upsert: true,
      },
    }));

    await ProfessorModel.bulkWrite(professorOps, { ordered: false });
  }

  const departments = await DepartmentModel.find({
    name: { $in: Array.from(departmentNames) },
  }).lean();

  const professors = await ProfessorModel.find({
    name: { $in: Array.from(professorNames) },
  }).lean();

  const departmentMap = new Map(
    departments.map((dept) => [dept.name, dept._id]),
  );
  const professorMap = new Map(
    professors.map((professor) => [professor.name, professor._id]),
  );

  const courseOps = [] as Array<{
    updateOne: {
      filter: Record<string, unknown>;
      update: Record<string, unknown>;
      upsert: boolean;
    };
  }>;

  for (const row of dataRows) {
    const code = normalizeText(getField(row, indexMap, CSV_HEADERS.courseCode));
    if (!code) {
      continue;
    }

    const name = normalizeText(getField(row, indexMap, CSV_HEADERS.courseName));
    const creditsRaw = normalizeText(getField(row, indexMap, CSV_HEADERS.credits));
    const credits = Number.parseFloat(creditsRaw);
    const department = normalizeText(getField(row, indexMap, CSV_HEADERS.department));
    const segmentName = normalizeText(getField(row, indexMap, CSV_HEADERS.segmentName));
    const slotCode = normalizeText(getField(row, indexMap, CSV_HEADERS.courseSlotCode));
    const classTimings = normalizeText(getField(row, indexMap, CSV_HEADERS.classTimings));
    const roomNo = normalizeText(getField(row, indexMap, CSV_HEADERS.roomNo));

    const occurrences = classTimings ? parseClassTimings(classTimings) : [];
    const slotLabel = slotCode || code;

    const coordinator = getField(row, indexMap, CSV_HEADERS.coordinatorName);
    const instructor = getField(row, indexMap, CSV_HEADERS.instructorName);
    const professorIds = Array.from(
      new Set([
        ...splitProfessorNames(coordinator),
        ...splitProfessorNames(instructor),
      ]),
    )
      .map((professorName) => professorMap.get(professorName))
      .filter((id) => id !== undefined);

    const update: Record<string, unknown> = {
      code,
      sourceTag,
    };

    if (name) {
      update.name = name;
    }
    if (!Number.isNaN(credits)) {
      update.credits = credits;
    }
    if (department) {
      update.department = department;
      update.departmentId = departmentMap.get(department) ?? null;
    }
    if (segmentName) {
      update.segmentName = segmentName;
    }
    if (classTimings) {
      update.classTimings = classTimings;
    }
    if (roomNo) {
      update.roomNo = roomNo;
    }
    if (professorIds.length) {
      update.professorIds = professorIds;
    }
    if (occurrences.length) {
      update.slotSchema = {
        label: slotLabel,
        occurrences,
      };
      update.sessionsPerWeek = occurrences.length;
    }

    const sourceKey = [
      code,
      department,
      segmentName,
      slotCode,
      classTimings,
      roomNo,
    ]
      .map((part) => normalizeText(part ?? ""))
      .join("|");

    courseOps.push({
      updateOne: {
        filter: { sourceTag, sourceKey },
        update: {
          $set: update,
          $setOnInsert: {
            students: 0,
            sourceKey,
          },
        },
        upsert: true,
      },
    });
  }

  if (courseOps.length) {
    await CourseModel.bulkWrite(courseOps, { ordered: false });
  }

  const seededCount = await CourseModel.countDocuments({ sourceTag });
  console.log(`Course seed complete. Seeded rows: ${courseOps.length}`);
  console.log(`Total courses tagged '${sourceTag}': ${seededCount}`);
};

run()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Course seed failed:", error.message || error);
    await disconnectDatabase();
    process.exit(1);
  });
