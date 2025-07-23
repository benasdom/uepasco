const domain = "https://ue-past-questions-back.vercel.app"

export async function fetchWithAuth(urlPath, option, refreshToken, setDataCallback, refreshUrl) {
  try {
    // Retrieve the stored userInfo from localStorage dynamically
    let stored = JSON.parse(localStorage.getItem("userInfo"));
    
    if (!stored || !stored.accessToken) {
      throw new Error("No access token found in localStorage");
    }

    // Set Authorization header dynamically from localStorage accessToken
    option.headers = option.headers || {};
    option.headers.Authorization = `Bearer ${stored.accessToken}`;
    const response = await fetch(urlPath, option);
    
    if (response.status === 401) {
      // Token expired, refresh it
      const newAccessToken = await refreshTokens(refreshToken, refreshUrl);
      // Update the Authorization header with the new access token
      option.headers.Authorization = `Bearer ${newAccessToken}`;
      
      return fetchWithAuth(urlPath, option, refreshToken, setDataCallback, refreshUrl);
    }
    const data = await response.json();
    console.log(data)


    if (!response.ok) {
      throw new Error(`Fetch failed with status ${JSON.stringify(data.error.details)} `);
    }
    
    if (setDataCallback) setDataCallback(data.data); // Call the callback with fetched data
    return data; // Return data for further use
  } catch (error) {
    console.log("Error fetching data:",error);
    throw error;
  }
}
export async function refreshTokens(refreshToken, refreshUrl = domain+"/api/v1/auth/refresh") {
  try {
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    const newAccessToken = data.data.token;

    // Retrieve the stored userInfo and update the accessToken
    let stored = JSON.parse(localStorage.getItem("userInfo"));
    if (stored) {
      stored.accessToken = newAccessToken;
      localStorage.setItem("userInfo", JSON.stringify(stored)); // Update localStorage with new token
    }

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}
export default domain;