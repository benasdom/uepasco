export const domain = "https://ue-past-questions-back.vercel.app"
export const LocalApiPath ="https://pasco-lovat.vercel.app"
//  "http://localhost:5175"

// Provides an empty object {} if localStorage.getItem("userInfo") returns null.
// This prevents JSON.parse from throwing an error.
const userInfoString = localStorage.getItem("userInfo"); 

export const userState= {
  ...JSON.parse(userInfoString ?? '{}') 
};
export async function fetchWithAuth(urlPath, option) {
  try {
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
      const newAccessToken = await refreshTokens();
      // Update the Authorization header with the new access token
      option.headers.Authorization = `Bearer ${newAccessToken}`;
      
      return fetchWithAuth(urlPath, option);
    }
    
    if (!response.ok) {
      console.log(response);
      throw new Error(`Fetch failed with status ${response.statusText}`);

    }
    
    const data = await response.json();
    console.log(data)


    return data.data; // Return data for further use
  } catch (error) {
    console.log("Error fetching data:",error);
  }
}
export async function refreshTokens(refreshUrl = domain+"/api/v1/auth/refresh") {

  try {
            let stored = JSON.parse(localStorage.getItem("userInfo"));    

        if (!stored || !stored.refreshToken) {
      throw new Error("No refresh token found in localStorage");
    }
      const refreshToken = `${stored.refreshToken}`;

    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.log(response.type,"Error 400")

      throw new Error("Failed to refresh token due to "+response.type);
    }

    const data = await response.json();

    const newAccessToken = data.data.token;

    // Retrieve the stored userInfo and update the accessToken
     stored = JSON.parse(localStorage.getItem("userInfo"));
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