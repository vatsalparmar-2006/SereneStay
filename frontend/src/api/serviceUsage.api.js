import api from "./axios";

export const addServiceUsage = (data) => {
  return api.post("/ServiceUsages/AddServiceUsage", data);
};

export const getAllServiceUsages = () => {
  return api.get("/ServiceUsages/GetAllUsage");
};

export const getServiceUsageById = (id) => {
  return api.get(`/ServiceUsages/GetUsageById/${id}`);
};

export const updateServiceUsage = (id, data) => {
  return api.put(`/ServiceUsages/UpdateUsage/${id}`, data);
};

export const deleteServiceUsage = (id) => {
  return api.delete(`/ServiceUsages/DeleteUsage/${id}`);
};
