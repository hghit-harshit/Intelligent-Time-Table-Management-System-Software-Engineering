import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Scopes for Google Classroom API
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly'
];

// Configuration
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const REDIRECT_URI = 'http://localhost:4000/api/auth/callback';

// Load OAuth2 client
function getOAuth2Client() {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8'));
  const clientId = credentials.web?.client_id || credentials.installed?.client_id;
  const clientSecret = credentials.web?.client_secret || credentials.installed?.client_secret;
  
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  return oauth2Client;
}

// Load credentials from token.json
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

// Save credentials to token.json
function saveCredentials(tokens) {
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

app.use(cors());
app.use(express.json());

// Generate OAuth URL
app.get('/api/auth/url', (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    res.json({ authorizationUrl: authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth callback
app.get('/api/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.redirect('http://localhost:5173/google-classroom?auth=error&message=No+code+received');
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens || !tokens.access_token) {
      return res.redirect('http://localhost:5173/google-classroom?auth=error&message=No+tokens+received');
    }
    
    saveCredentials(tokens);
    res.redirect('http://localhost:5173/google-classroom?auth=success');
  } catch (error) {
    res.redirect(`http://localhost:5173/google-classroom?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  const oauth2Client = getCredentials();
  if (oauth2Client && oauth2Client.credentials?.access_token) {
    return res.json({ authenticated: true });
  }
  res.json({ authenticated: false });
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    if (existsSync(TOKEN_FILE)) {
      await fs.rm(TOKEN_FILE);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch future assignments
app.get('/api/assignments', async (req, res) => {
  const oauth2Client = getCredentials();
  if (!oauth2Client || !oauth2Client.credentials?.access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    
    // Fetch courses
    const courseResults = await classroom.courses.list({ pageSize: 50 });
    const courses = courseResults.data.courses || [];

    // Fetch assignments with due dates
    const allAssignments = [];
    const today = new Date();

    for (const course of courses) {
      try {
        const courseworkResults = await classroom.courses.courseWork.list({
          courseId: course.id,
          pageSize: 50
        });
        
        const courseworkList = courseworkResults.data.courseWork || [];
        
        for (const cw of courseworkList) {
          const dueDate = cw.dueDate;
          if (dueDate) {
            const dueDateTime = new Date(dueDate.year || 2000, (dueDate.month || 1) - 1, dueDate.day || 1);
            
            // Only include future assignments
            if (dueDateTime >= today) {
              allAssignments.push({
                id: cw.id,
                title: cw.title || 'Untitled',
                courseName: course.name,
                courseId: course.id,
                dueDate: {
                  year: dueDate.year,
                  month: dueDate.month || 1,
                  day: dueDate.day || 1,
                  hour: cw.dueTime?.hours || 0,
                  minute: cw.dueTime?.minutes || 0
                },
                state: cw.state,
                maxPoints: cw.maxPoints,
                workType: cw.workType
              });
            }
          }
        }
      } catch (courseError) {
        console.error(`Error fetching coursework for course ${course.id}:`, courseError.message);
      }
    }

    // Sort by due date
    allAssignments.sort((a, b) => {
      const dateA = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day, a.dueDate.hour, a.dueDate.minute);
      const dateB = new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day, b.dueDate.hour, b.dueDate.minute);
      return dateA - dateB;
    });

    res.json({ assignments: allAssignments });
  } catch (error) {
    console.error('Error fetching assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get Google Classroom link
app.get('/api/classroom-link', (req, res) => {
  res.json({ url: 'https://classroom.google.com' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
