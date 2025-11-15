/**
 * Base API request utility
 * Handles all HTTP calls to backend
 */

export async function apiRequest(endpoint, options = {}) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const url = `${baseURL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response body is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Re-throw with context
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * GET request
 */
export function apiGet(endpoint) {
  return apiRequest(endpoint, {
    method: "GET",
  });
}

/**
 * POST request
 */
export function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
}
