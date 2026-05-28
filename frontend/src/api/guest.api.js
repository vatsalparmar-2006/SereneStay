import api from "./axios";

export const addGuest = (data) => {
  return api.post("/Guest/AddGuest", data);
};

export const getAllGuests = (page = 1, pageSize = 5, search = "") => {
  return api.get(`/Guest/GetAllGuest`, {
    params: { page, pageSize, search }
  });
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
