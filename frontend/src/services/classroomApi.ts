import {
  GC_AUTH_URL_EP,
  GC_AUTH_STATUS_EP,
  GC_AUTH_LOGOUT_EP,
  GC_ASSIGNMENTS_EP,
  GC_CLASSROOM_LINK_EP,
} from "../constants/Api_constants";

export async function getAuthUrl() {
  try {
    const response = await fetch(GC_AUTH_URL_EP);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to get auth URL");
    }
    return data.authorizationUrl;
  } catch (error) {
    console.error("Error getting auth URL:", error);
    throw error;
  }
}

export async function checkAuthStatus() {
  try {
    const response = await fetch(GC_AUTH_STATUS_EP);
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error("Error checking auth status:", error);
    return false;
  }
}

export async function logout() {
  try {
    const response = await fetch(GC_AUTH_LOGOUT_EP, { method: "POST" });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}

export async function getAssignments() {
  try {
    const response = await fetch(GC_ASSIGNMENTS_EP);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch assignments");
    }
    return data.assignments;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
}

export async function getClassroomLink() {
  try {
    const response = await fetch(GC_CLASSROOM_LINK_EP);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error getting classroom link:", error);
    return "https://classroom.google.com";
  }
}