const GEMINI_SYSTEM_PROMPT = `You are a helpful student timetable assistant for an academic scheduling app.
Answer clearly and concisely.
Help with classes, timetable navigation, course planning, exam reminders, and schedule-related questions.
If the user asks for something outside the app's context, answer briefly and steer them back to timetable assistance.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildGeminiBody = (history, message) => ({
  systemInstruction: {
    parts: [{ text: GEMINI_SYSTEM_PROMPT }],
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

const isRetryableStatus = (status) => [429, 500, 502, 503, 504].includes(status);

const normalizeHistory = (history = []) =>
  history
    .filter((item) => item && typeof item.text === "string" && item.text.trim())
    .slice(-12)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.text.trim() }],
    }));

const extractGeminiText = (payload) => {
  const textParts = payload?.candidates?.[0]?.content?.parts || [];
  return textParts
    .map((part) => part?.text || "")
    .join("")
    .trim();
};

export const chatWithAssistant = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const maxAttempts = 3;
    let lastStatus = 500;
    let lastMessage = "Gemini request failed";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response;
      let data;

      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildGeminiBody(history, message)),
        });
        data = await response.json();
      } catch (fetchError) {
        lastStatus = 503;
        lastMessage = fetchError.message || "Network error while contacting Gemini";

        if (attempt < maxAttempts) {
          await sleep(500 * attempt);
          continue;
        }

        break;
      }

      if (response.ok) {
        const reply = extractGeminiText(data) || "I could not generate a response just now.";

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
      error: error.message,
    });
  }
};