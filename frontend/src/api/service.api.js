import api from "./axios";

export const addService = (data) => {
  return api.post("/Services/AddService", data);
};

export const getAllServices = (page = 1, pageSize = 5, search = "") => {
  return api.get(`/Services/AllServices`, {
    params: { page, pageSize, search }
  });
};

export const getServiceById = (id) => {
  return api.get(`/Services/GetServicesById/${id}`);
};

export const updateService = (id, data) => {
  return api.put(`/Services/UpdateService/${id}`, data);
};

export const deleteService = (id) => {
  return api.delete(`/Services/DeleteService/${id}`);
};
