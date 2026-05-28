import api from "./axios";

const getAllStaff = (page = 1, pageSize = 5, search = "") => {
  return api.get(`/Staff/GetAllStaff`, {
    params: { page, pageSize, search }
  });
};

const getStaffById = (id) => {
  return api.get(`/Staff/GetStaffById/${id}`);
};

const addStaff = (data) => {
  return api.post("/Staff/AddStaff", data);
};

const updateStaff = (id, data) => {
  return api.put(`/Staff/UpdateStaff/${id}`, data);
};

const deleteStaff = (id) => {
  return api.delete(`/Staff/DeleteStaff/${id}`);
};

export {
  getAllStaff,
  getStaffById,
  addStaff,
  updateStaff,
  deleteStaff
};
