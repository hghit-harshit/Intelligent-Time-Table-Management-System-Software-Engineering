import { httpClient } from "./httpClient";

export async function sendAssistantMessage(message, history = []) {
  let data;

  try {
    data = await httpClient.request("/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });
  } catch (error) {
    // If httpClient clears auth, the app will log out, but we still throw a friendly error
    if (error.message === "Missing bearer token" || error.message === "Invalid or expired token") {
      throw new Error("Unauthorized request. Please log in again so your auth token is sent to the backend.");
    }
    
    // Provide a fallback error if the backend was completely unreachable
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Cannot reach backend AI service. Make sure backend is running on port 5001.");
    }

    // Re-throw any message parsed by httpClient
    throw error;
  }

  if (!data || typeof data.reply !== "string") {
    throw new Error("Invalid assistant response format");
  }

  return data;
}