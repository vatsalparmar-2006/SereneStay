import api from "./axios";

export const addGuest = (data) => {
  return api.post("/Guest/AddGuest", data);
};

export const getAllGuests = () => {
  return api.get("/Guest/GetAllGuest");
};

export const getGuestById = (id) => {
  return api.get(`/Guest/GetAllGuest/${id}`);
};

export const updateGuest = (id, data) => {
  return api.put(`/Guest/UpdateGuest/${id}`, data);
};

export const deleteGuest = (id) => {
  return api.delete(`/Guest/DeleteGuest/${id}`);
};

export const getGuestByEmail = (email) => {
  return api.get(`/Guest/GetGuestByEmail/${email}`);
};
