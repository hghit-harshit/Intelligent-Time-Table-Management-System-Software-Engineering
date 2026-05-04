import type { Request, Response } from "express";
import { StudentEnrollmentModel } from "../../database/models/studentEnrollmentModel.js";
import { CourseModel } from "../../database/models/courseModel.js";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";
import { UserModel } from "../../database/models/userModel.js";

declare const process: {
  env: Record<string, string | undefined>;
};

const GEMINI_SYSTEM_PROMPT = `You are a helpful student timetable assistant for an academic scheduling app.
Answer clearly and concisely.
Help with classes, timetable navigation, course planning, exam reminders, and schedule-related questions.
If the user asks for something outside the app's context, answer briefly and steer them back to timetable assistance.`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type HistoryItem = {
  role?: string;
  text?: string;
};

const buildGeminiBody = (history: HistoryItem[], message: string, customSystemPrompt?: string) => ({
  systemInstruction: {
    parts: [{ text: customSystemPrompt || GEMINI_SYSTEM_PROMPT }],
  },
  contents: [
    ...normalizeHistory(history),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ],
  generationConfig: {
    temperature: 0.6,
    maxOutputTokens: 700,
  },
});

const isRetryableStatus = (status: number) =>
  [429, 500, 502, 503, 504].includes(status);

const normalizeHistory = (history: HistoryItem[] = []) =>
  history
    .filter((item) => item && typeof item.text === "string" && item.text.trim())
    .slice(-12)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.text!.trim() }],
    }));

const extractGeminiText = (payload: unknown) => {
  const typed = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const textParts = typed?.candidates?.[0]?.content?.parts || [];
  return textParts
    .map((part) => part?.text || "")
    .join("")
    .trim();
};

export const chatWithAssistant = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on the backend",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let customSystemPrompt = GEMINI_SYSTEM_PROMPT;

    // If the user is a student, fetch their courses to provide context to the AI
    if (req.user?.email && req.user?.role === "student") {
      try {
        // Look up by email to handle cases where the DB was wiped but the token is stale
        const actualUser = await UserModel.findOne({ email: req.user.email }).lean();
        
        if (actualUser) {
          const enrollment = await StudentEnrollmentModel.findOne({ studentId: actualUser._id })
            .sort({ createdAt: -1 })
            .lean();

        if (enrollment && enrollment.enrolledCourseIds?.length) {
          const courses = await CourseModel.find({ _id: { $in: enrollment.enrolledCourseIds } }).lean();
          if (courses.length > 0) {
            const courseList = courses.map(c => `- ${c.code || "N/A"}: ${c.name || "Untitled"} (${c.credits || 0} credits)`).join("\n");
            customSystemPrompt += `\n\nContext for this user:\nThe user is a student currently enrolled in the following courses:\n${courseList}`;
            
            const timetable = await TimetableResultModel.findOne({ isLatest: true }).lean();
            if (timetable && Array.isArray(timetable.assignments)) {
              const enrolledCodes = new Set(courses.map(c => c.code).filter(Boolean));
              const studentAssignments = timetable.assignments.filter((a: any) => enrolledCodes.has(a.courseCode));
              
              if (studentAssignments.length > 0) {
                // Sort by day and time for better readability by the LLM
                const dayOrder: Record<string, number> = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                studentAssignments.sort((a: any, b: any) => {
                  const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
                  if (dayDiff !== 0) return dayDiff;
                  return (a.startTime || "").localeCompare(b.startTime || "");
                });

                const scheduleStr = studentAssignments.map((a: any) => 
                  `- ${a.day} ${a.startTime}-${a.endTime}: ${a.courseName} (${a.courseCode}) in ${a.roomName || "TBA"} with ${a.professorName || "TBA"}`
                ).join("\n");
                
                customSystemPrompt += `\n\nTheir current weekly schedule is:\n${scheduleStr}`;
              }
            }
          }
        }
        } // Closing brace for if (actualUser)
      } catch (err) {
        // Silently ignore DB errors here to not break the AI functionality
        console.error("Failed to fetch student courses for AI context:", err);
      }
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const maxAttempts = 3;
    let lastStatus = 500;
    let lastMessage = "Gemini request failed";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response: globalThis.Response;
      let data: any;

      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildGeminiBody(history, message, customSystemPrompt)),
        });
        data = await response.json();
      } catch (fetchError) {
        lastStatus = 503;
        lastMessage =
          fetchError instanceof Error
            ? fetchError.message
            : "Network error while contacting Gemini";

        if (attempt < maxAttempts) {
          await sleep(500 * attempt);
          continue;
        }

        break;
      }

      if (response.ok) {
        const reply =
          extractGeminiText(data) || "I could not generate a response just now.";

        return res.json({
          success: true,
          reply,
        });
      }

      lastStatus = response.status;
      lastMessage = data?.error?.message || "Gemini request failed";

      if (attempt < maxAttempts && isRetryableStatus(response.status)) {
        await sleep(600 * attempt);
        continue;
      }

      break;
    }

    if (lastStatus === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini rate limit or quota exceeded. Please wait a minute and try again, or use a key/model with available quota.",
      });
    }

    return res.status(lastStatus).json({
      success: false,
      message: lastMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to contact Gemini",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
