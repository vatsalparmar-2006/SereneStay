import api from "./axios";

const getAllRooms = () => {
  return api.get("/Rooms/AllRooms");
};  

const getRoomById = (id) => {
  return api.get(`/Rooms/GetRoomById/${id}`);
}; 

const addRoom = (data) => {
  return api.post("/Rooms/AddRoom", data);
};

const updateRoom  = (id, data) => {
  return api.put(`/Rooms/UpdateRoom/${id}`, data);
};

const deleteRoom = (id) => {
  return api.delete(`/Rooms/DeleteRoom/${id}`);
};

const searchAvailableRooms = ({ checkIn, checkOut, adults, children }) => {
  return api.get("/Rooms/SearchAvailableRooms", {
    params: {
      CheckInDate: checkIn,
      CheckOutDate: checkOut,
      Adults: adults,
      Children: children,
    },
  });
};


export {
  getAllRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
  searchAvailableRooms
};