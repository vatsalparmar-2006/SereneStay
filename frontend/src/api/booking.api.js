import api from "./axios";

export const addBooking = (data) => {
  return api.post("/Booking/AddBooking", data);
};

export const getAllBookings = () => {
  return api.get("/Booking/GetAllBookings");
};

export const getBookingById = (id) => {
  return api.get(`/Booking/GetBookingById/${id}`);
};

export const updateBooking = (id, data) => {
  return api.put(`/Booking/UpdateBooking/${id}`, data);
};

export const deleteBooking = (id) => {
  return api.delete(`/Booking/DeleteBooking/${id}`);
};

export const getAllBookingsWithInvoices = () => {
  return api.get("/Booking/GetAllBookingsWithInvoices");
};

export const getBookingsByEmail = (email) => {
  return api.get(`/Booking/GetBookingsByEmail/${email}`);
};
