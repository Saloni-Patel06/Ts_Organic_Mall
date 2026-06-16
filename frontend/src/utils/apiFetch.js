// const API_BASE = "http://localhost:5000";
const API_BASE = "https://ts-organic-mall-backend.onrender.com";

export const apiFetch = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  // If token expired, try to refresh it
  if (response.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
      });

      const refreshData = await refreshRes.json();

      if (refreshData.success) {
        const newAccessToken = refreshData.accessToken;

        // Save new token
        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request
        headers["Authorization"] = `Bearer ${newAccessToken}`;

        response = await fetch(`${API_BASE}${url}`, {
          ...options,
          headers
        });

        return response;
      }
    } catch (err) {
      // If refresh request fails (network, server error, etc.), fall back to logout.
      console.error("Token refresh failed:", err);
    }

    // If refresh fails or is invalid, clear auth and force login.
    localStorage.clear();
    window.location.href = "/login";

    // Ensure callers don't try to read from an undefined response.
    throw new Error("Authentication required");
  }

  return response;
};