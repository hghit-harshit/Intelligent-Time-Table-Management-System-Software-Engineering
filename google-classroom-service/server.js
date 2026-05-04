import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents',
];

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const REDIRECT_URI = 'http://localhost:8000/auth/callback';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const CLASSROOM_PATH = '/StudentPage/google-classroom';

function getOAuth2Client() {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8'));
  const clientId = credentials.web?.client_id || credentials.installed?.client_id;
  const clientSecret = credentials.web?.client_secret || credentials.installed?.client_secret;
  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

function getCredentials() {
  if (existsSync(TOKEN_FILE)) {
    try {
      const tokens = JSON.parse(readFileSync(TOKEN_FILE, 'utf-8'));
      if (tokens && Object.keys(tokens).length > 0) {
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials(tokens);
        return oauth2Client;
      }
    } catch (e) {
      console.error('Error loading tokens:', e.message);
    }
  }
  return null;
}

function saveCredentials(tokens) {
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

// Find-or-create a Drive folder
async function ensureFolder(drive, folderName, parentId = null) {
  let q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) q += ` and '${parentId}' in parents`;
  const existing = await drive.files.list({ q, fields: 'files(id,name)', spaces: 'drive' });
  if (existing.data.files?.length > 0) return existing.data.files[0].id;
  const meta = { name: folderName, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) meta.parents = [parentId];
  const folder = await drive.files.create({ resource: meta, fields: 'id' });
  return folder.data.id;
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Auth ──────────────────────────────────────────────────────────────

app.get('/api/auth/url', (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
    res.json({ url: authUrl, authorizationUrl: authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.redirect(`${FRONTEND_ORIGIN}${CLASSROOM_PATH}?auth=error&message=No+code+received`);
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens?.access_token) return res.redirect(`${FRONTEND_ORIGIN}${CLASSROOM_PATH}?auth=error&message=No+tokens`);
    saveCredentials(tokens);
    res.redirect(`${FRONTEND_ORIGIN}${CLASSROOM_PATH}?auth=success`);
  } catch (error) {
    res.redirect(`${FRONTEND_ORIGIN}${CLASSROOM_PATH}?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

app.get('/api/auth/status', (req, res) => {
  const c = getCredentials();
  const ok = !!(c?.credentials?.access_token);
  res.json({ isAuthenticated: ok, authenticated: ok });
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    if (existsSync(TOKEN_FILE)) await fs.rm(TOKEN_FILE);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Google Drive Notes ────────────────────────────────────────────────

/**
 * POST /api/drive/notes/create
 * Body: { courseCode, classDate }   e.g. { courseCode: "CS201", classDate: "2025-05-04" }
 * Returns: { googleDocId, webViewLink, folderId, alreadyExisted }
 */
app.post('/api/drive/notes/create', async (req, res) => {
  const oauth2Client = getCredentials();
  if (!oauth2Client?.credentials?.access_token) {
    return res.status(401).json({ error: 'Not authenticated with Google' });
  }

  const { courseCode, classDate } = req.body;
  if (!courseCode || !classDate) {
    return res.status(400).json({ error: 'courseCode and classDate are required' });
  }

  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const rootFolderId = await ensureFolder(drive, 'DISHA_Notes');
    const courseFolderId = await ensureFolder(drive, courseCode.toUpperCase(), rootFolderId);

    const docTitle = `${courseCode.toUpperCase()}_${classDate}`;

    // Check for existing doc
    const q = `name='${docTitle}' and '${courseFolderId}' in parents and trashed=false`;
    const existing = await drive.files.list({ q, fields: 'files(id,name,webViewLink)', spaces: 'drive' });

    if (existing.data.files?.length > 0) {
      const f = existing.data.files[0];
      return res.json({ googleDocId: f.id, webViewLink: f.webViewLink, folderId: courseFolderId, alreadyExisted: true });
    }

    // Create new Google Doc
    const doc = await drive.files.create({
      resource: {
        name: docTitle,
        mimeType: 'application/vnd.google-apps.document',
        parents: [courseFolderId],
      },
      fields: 'id,webViewLink',
    });

    res.json({ googleDocId: doc.data.id, webViewLink: doc.data.webViewLink, folderId: courseFolderId, alreadyExisted: false });
  } catch (error) {
    console.error('Drive notes create error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/drive/notes/list/:courseCode
 * Lists all note docs in DISHA_Notes/<courseCode>/
 */
app.get('/api/drive/notes/list/:courseCode', async (req, res) => {
  const oauth2Client = getCredentials();
  if (!oauth2Client?.credentials?.access_token) {
    return res.status(401).json({ error: 'Not authenticated with Google' });
  }

  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const rootFolderId = await ensureFolder(drive, 'DISHA_Notes');
    const courseCode = req.params.courseCode.toUpperCase();
    const courseFolderId = await ensureFolder(drive, courseCode, rootFolderId);

    const q = `'${courseFolderId}' in parents and trashed=false and mimeType='application/vnd.google-apps.document'`;
    const result = await drive.files.list({
      q,
      fields: 'files(id,name,webViewLink,modifiedTime)',
      spaces: 'drive',
      orderBy: 'modifiedTime desc',
    });

    res.json({ files: result.data.files || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Google Classroom Assignments ──────────────────────────────────────

app.get('/api/assignments', async (req, res) => {
  const oauth2Client = getCredentials();
  if (!oauth2Client?.credentials?.access_token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    const courseResults = await classroom.courses.list({ pageSize: 50 });
    const courses = courseResults.data.courses || [];
    const allAssignments = [];
    const today = new Date();

    for (const course of courses) {
      try {
        const cwResults = await classroom.courses.courseWork.list({ courseId: course.id, pageSize: 50 });
        for (const cw of cwResults.data.courseWork || []) {
          const dueDate = cw.dueDate;
          if (dueDate) {
            const due = new Date(dueDate.year || 2000, (dueDate.month || 1) - 1, dueDate.day || 1);
            if (due >= today) {
              allAssignments.push({
                id: cw.id, title: cw.title || 'Untitled',
                courseName: course.name, courseId: course.id,
                dueDate: { year: dueDate.year, month: dueDate.month || 1, day: dueDate.day || 1, hour: cw.dueTime?.hours || 0, minute: cw.dueTime?.minutes || 0 },
                state: cw.state, maxPoints: cw.maxPoints, workType: cw.workType,
              });
            }
          }
        }
      } catch (e) { /* skip course on error */ }
    }

    allAssignments.sort((a, b) => {
      const da = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day);
      const db = new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day);
      return da - db;
    });

    res.json({ assignments: allAssignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/classroom-link', (req, res) => res.json({ url: 'https://classroom.google.com' }));

app.listen(PORT, () => console.log(`Google service running on http://localhost:${PORT} — callback: ${REDIRECT_URI}`));
