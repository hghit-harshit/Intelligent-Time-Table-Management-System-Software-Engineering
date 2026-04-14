const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Get Google OAuth authorization URL
 */
export async function getAuthUrl() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/url`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get auth URL');
    }
    return data.authorizationUrl;
  } catch (error) {
    console.error('Error getting auth URL:', error);
    throw error;
  }
}

/**
 * Check authentication status
 */
export async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`);
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
}

/**
 * Logout and clear credentials
 */
export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

/**
 * Fetch future assignments with deadlines
 */
export async function getAssignments() {
  try {
    const response = await fetch(`${API_BASE_URL}/assignments`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch assignments');
    }
    return data.assignments;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
}

/**
 * Get Google Classroom direct link
 */
export async function getClassroomLink() {
  try {
    const response = await fetch(`${API_BASE_URL}/classroom-link`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting classroom link:', error);
    return 'https://classroom.google.com';
  }
}
