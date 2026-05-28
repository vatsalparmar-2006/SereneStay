import axios from "axios";

const API_URL = "https://localhost:7276/api/Staff"; 

export const loginStaff = async (credentials) => {
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