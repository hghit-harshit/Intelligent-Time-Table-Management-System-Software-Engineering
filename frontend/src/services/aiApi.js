import { withAuthHeaders } from "./authInterceptor";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const toFriendlyMessage = (status, serverMessage) => {
  if (status === 429) {
    return "Gemini quota or rate limit reached. Please wait a minute and try again.";
  }

  if (status === 401 || status === 403) {
    return "Unauthorized request. Please log in again so your auth token is sent to the backend.";
  }

  if (status >= 500) {
    return "Assistant server is temporarily unavailable. Please try again shortly.";
  }

  return serverMessage || "Assistant request failed";
};

export async function sendAssistantMessage(message, history = []) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: withAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ message, history }),
    });
  } catch {
    throw new Error("Cannot reach backend AI service. Make sure backend is running on port 5001.");
  }

  const raw = await response.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const serverMessage = data?.message || "Assistant request failed";
    throw new Error(toFriendlyMessage(response.status, serverMessage));
  }

  if (!data || typeof data.reply !== "string") {
    throw new Error("Invalid assistant response format");
  }

  return data;
}