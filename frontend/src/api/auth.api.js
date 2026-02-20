import axios from "axios";

// Standard base URL - ensure this matches your C# launchSettings.json
const API_URL = "https://localhost:7276/api/Staff"; 

export const loginStaff = async (credentials) => {
  // credentials should be { username, password }
  return await axios.post(`${API_URL}/login`, credentials);
};

// No need for a separate getProfile if your login returns user data, 
// but useful for re-validating the token on refresh
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  return await axios.get(`${API_URL}/GetStaffById`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};