# Backend Reconstruction Guide (Notes Integration + Task System)

This document is a branch-accurate reconstruction guide for:
- Main backend (`backend/`) on **port 5001**
- Google Workspace microservice (`google-classroom-service/`) on **port 4000**

Important mapping notes:
- Requested `taskRoutes.js` is implemented as [`backend/src/modules/task/task.routes.ts`](backend/src/modules/task/task.routes.ts).
- Requested `noteModel.js` is implemented as [`backend/src/database/models/noteModel.ts`](backend/src/database/models/noteModel.ts).
- Requested `saveTask` / `toggleCompletion` are implemented as generic `create` and `update` flows (no separately named methods in this branch).

---

## 1) Task Integration (Main Backend - Port 5001)

## 1.1 Database Schema (`TaskModel`)

Source: `backend/src/database/models/taskModel.ts`

```ts
import mongoose from "mongoose";

const taskCategories = ["Academic", "Assignment", "Personal", "Exam Prep"] as const;
const reminderOffsets = [5, 15, 30, 60] as const;
const taskStatuses = ["pending", "completed"] as const;

const taskSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    category: {
      type: String,
      enum: taskCategories,
      required: true,
    },
    status: {
      type: String,
      enum: taskStatuses,
      default: "pending",
      index: true,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderOffset: {
      type: Number,
      enum: [...reminderOffsets, null],
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "student_tasks",
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as any)?.toString?.() ?? ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.studentId;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  },
);

taskSchema.index({ studentId: 1, date: 1 });

export const TaskModel = mongoose.model("Task", taskSchema);
```

Implementation truth on requested fields:
- `status` exists (`pending` / `completed`).
- `studentId` association exists (`ObjectId` ref `User`).
- `priority` does **not** exist in this branch schema/types/validators.

## 1.2 API Routes (CRUD)

Source: `backend/src/modules/task/task.routes.ts` (mounted at `/api/student/tasks`)

```ts
import { Router } from "express";
import { taskController } from "./task.controller.js";

const router = Router();

// GET    /api/student/tasks
router.get("/", taskController.getAll);

// GET    /api/student/tasks/:id
router.get("/:id", taskController.getById);

// POST   /api/student/tasks
router.post("/", taskController.create);

// PATCH  /api/student/tasks/:id
router.patch("/:id", taskController.update);

// DELETE /api/student/tasks/:id
router.delete("/:id", taskController.remove);

export default router;
```

## 1.3 Controller/Service Logic (`saveTask` + `toggleCompletion` equivalent)

There is no explicit `saveTask` or `toggleCompletion` method name. Equivalent flow is:
- `saveTask` => `taskController.create` -> `taskService.create` -> `taskRepository.create`
- `toggleCompletion` => `taskController.update` (PATCH `status`) -> `taskService.update` -> `taskRepository.update`

Key persistence behavior:
- Completion state is persisted as `status: "completed"` in MongoDB.
- “Strikethrough” is frontend rendering logic driven by this status (not persisted as styling in backend).

`taskController.update` (status patch entry point):

```ts
const patch = updateTaskSchema.parse(req.body);
const task = await taskService.update(String(req.params.id), studentId, patch as any);
return ok(res, task);
```

`taskRepository.update` (Mongo persistence):

```ts
return TaskModel.findOneAndUpdate(
  { _id: taskId, studentId },
  { $set: patch },
  { new: true },
);
```

---

## 2) Notes & Google Workspace Service (Microservice - Port 4000)

## 2.1 Authentication Flow (OAuth2)

Source: `google-classroom-service/server.js`

### Credential loading
- `CREDENTIALS_FILE = ./credentials.json`
- Fallback env vars:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- Redirect URI hardcoded: `http://localhost:4000/api/auth/callback`

### Token handling
- Token file: `TOKEN_FILE = ./token.json`
- `getCredentials()` loads `token.json` and sets it on OAuth2 client.
- `saveCredentials(tokens)` writes token JSON to disk.

### Auth endpoints
- `GET /api/auth/url` -> returns Google consent URL.
- `GET /api/auth/callback` -> exchanges `code` for tokens; persists `token.json`; redirects frontend with `?auth=success|error`.
- `GET /api/auth/status` -> `{ authenticated: boolean }` based on loaded token presence.
- `POST /api/auth/logout` -> deletes `token.json`.

Design implication:
- OAuth tokens are service-local and file-based (single token store), not user-session keyed in DB.

## 2.2 "Find or Create" Drive Folder Logic

Source: `google-classroom-service/server.js`

Requested “recursive helper” equivalent in this branch is a reusable helper function called sequentially (not recursively):

```js
async function ensureFolder(drive, folderName, parentId = null) {
  let q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const existing = await drive.files.list({
    q,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id;
  }

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });

  return folder.data.id;
}
```

Used as:
1. `ensureFolder(drive, "DISHA_Notes")`
2. `ensureFolder(drive, courseCode, rootFolderId)`

## 2.3 File Naming & Doc Creation

Source: `google-classroom-service/server.js` (`POST /api/drive/notes/create`)

Naming convention:
- `docTitle = ${courseCode}_${classDate}` (example: `CS201_2025-02-19`)

Creation logic:
1. Validate `courseCode`, `classDate`.
2. Ensure `DISHA_Notes` root folder.
3. Ensure course subfolder (e.g., `CS201`).
4. Search existing doc with exact name in course folder.
5. If found, return existing metadata.
6. Else create Google Doc with:
   - `mimeType: 'application/vnd.google-apps.document'`
   - `parents: [courseFolderId]`

## 2.4 Metadata Bridge Back to Main Backend

Microservice response shape:

```json
{
  "googleDocId": "...",
  "webViewLink": "...",
  "folderId": "..."
}
```

Main backend `note.service.ts` calls:
- `POST ${GOOGLE_SERVICE_URL}/drive/notes/create` (defaults to `http://localhost:4000/api`)
- On success persists these fields in Mongo (`student_notes` collection).
- On failure raises `502` and does not create a DB record.

---

## 3) Main Backend Persistence (Note Model)

## 3.1 Note Schema + Compound Unique Index

Source: `backend/src/database/models/noteModel.ts`

```ts
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      default: "",
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    classDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    googleDocId: {
      type: String,
      required: true,
    },
    webViewLink: {
      type: String,
      required: true,
    },
    folderId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "student_notes",
  },
);

// Unique compound index: one note per course+date per student
noteSchema.index(
  { studentId: 1, courseCode: 1, classDate: 1 },
  { unique: true },
);

export const NoteModel = mongoose.model("Note", noteSchema);
```

This index is the hard guardrail against duplicate docs for same:
- student
- course
- session date

---

## 4) System-Wide Wiring

## 4.1 Middleware and Auth Wiring

### Frontend -> 5001 (main backend)
- Frontend sends `Authorization: Bearer <JWT>` via auth interceptor.
- 5001 enforces `authMiddleware` on `/api/*` routes:
  - mounted in `backend/src/server.ts`
  - token verified in `backend/src/middlewares/auth.middleware.ts`
  - `req.user.userId` is used as `studentId` in task/note controllers.

### 5001 -> 4000 (notes create bridge)
- `note.service.ts` calls microservice with server-to-server `fetch`.
- No bearer token is forwarded to 4000 in current implementation.
- 4000 trusts its own persisted Google OAuth token (`token.json`).

### Frontend -> 4000 (Google connect UX)
- Frontend directly calls:
  - `/api/auth/url`
  - `/api/auth/status`
  - `/api/auth/logout`
- OAuth callback returns to frontend route `/StudentPage/google-classroom`.

## 4.2 Critical Dependencies (`package.json`)

### Main backend (`backend/package.json`)
- `express`
- `cors`
- `mongoose`
- `jsonwebtoken`
- `zod`
- `dotenv`
- `bcryptjs`

### Google service (`google-classroom-service/package.json`)
- `express`
- `cors`
- `google-auth-library`
- `googleapis`

Requested example libs status:
- `google-auth-library`: present (port 4000)
- `googleapis`: present (port 4000)
- `cors`: present (both services)
- `axios`: **not present** (this branch uses `fetch`)

---

## End-to-End Data Flow: "Student clicks View Notes" -> Google Doc opens

1. Student opens timetable/day/class context in frontend.
2. Frontend calls main backend:
   - `GET /api/notes/check` or `GET /api/notes/course/:courseCode`
3. If note exists:
   - backend returns stored `googleDocId` + `webViewLink`.
   - frontend navigates to notes doc route and opens the returned link.
4. If note does not exist and user triggers create:
   - frontend calls `POST /api/notes/create` (5001) with `courseCode`, `classDate`, optional `sessionId`.
5. Main backend note service performs idempotency check in Mongo:
   - lookup by `(studentId, courseCode, classDate)`.
6. If not found, 5001 calls 4000:
   - `POST /api/drive/notes/create`.
7. Google service verifies OAuth token loaded from `token.json`.
8. Google service ensures folder structure:
   - `DISHA_Notes/`
   - `<CourseCode>/`
9. Google service finds existing doc named `<CourseCode>_<YYYY-MM-DD>` inside course folder.
10. If doc exists:
    - returns existing `{ googleDocId, webViewLink, folderId }`.
11. If doc does not exist:
    - creates Google Doc and returns `{ googleDocId, webViewLink, folderId }`.
12. Main backend persists note metadata in `student_notes` collection with compound unique key.
13. Main backend responds to frontend with normalized payload (`id`, `googleDocId`, `webViewLink`, `noteKey`, `alreadyExisted`).
14. Frontend uses `webViewLink` (or fallback docs URL from ID) and opens the doc for the student.

---

## Clean-Branch Reconstruction Order

1. Recreate Mongoose models: `TaskModel`, `NoteModel` (with unique compound index).
2. Recreate auth middleware and mount protected `/api` router.
3. Rebuild task module (`schema`, `repository`, `service`, `controller`, `routes`) with `status` PATCH behavior.
4. Rebuild note module with idempotency check + server-to-server microservice call.
5. Rebuild Google microservice OAuth + token file handling + `ensureFolder` + note doc endpoint.
6. Wire env variables:
   - `MONGODB_URI`, `JWT_SECRET` (5001)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_ORIGIN` (4000, optional if not using `credentials.json`)
   - `GOOGLE_SERVICE_URL` (5001 -> 4000 bridge)
