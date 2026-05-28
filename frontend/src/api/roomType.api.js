import api from "./axios";

const getAllRoomTypes = (page = 1, pageSize = 5, search = "") => {
  return api.get(`/RoomType/AllRoomType`, {
    params: { page, pageSize, search }
  });
};

const getRoomTypeById = (id) => {
  return api.get(`/RoomType/GetRoomTypeById/${id}`);
};

const addRoomType = (data) => {
  return api.post("/RoomType/AddRoomType", data);
};

const updateRoomType = (id, data) => {
  return api.put(`/RoomType/UpdateRoomType/${id}`, data);
};

const deleteRoomType = (id) => {
  return api.delete(`/RoomType/DeleteRoomType/${id}`);
};

export {
  getAllRoomTypes,
  getRoomTypeById,
  addRoomType,
  updateRoomType,
  deleteRoomType
};
