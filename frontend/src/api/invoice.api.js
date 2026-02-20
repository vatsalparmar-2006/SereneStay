import api from "./axios";

export const addInvoice = (data) => {
  return api.post("/Invoices/AddInvoice", data);
};

export const getAllInvoices = () => {
  return api.get("/Invoices/GetAllInvoices");
};

export const getInvoiceById = (id) => {
  return api.get(`/Invoices/GetInvoiceById/${id}`);
};

export const updateInvoice = (id, data) => {
  return api.put(`/Invoices/UpdateInvoice/${id}`, data);
};

export const deleteInvoice = (id) => {
  return api.delete(`/Invoices/DeleteInvoice/${id}`);
};

export const settleBalance = (id) => {
  return api.patch(`/Invoices/SettleBalance/${id}`);
}

export const downloadInvoicePdf = (id) => {
  return api.get(`/Invoices/DownloadInvoicePdf/${id}`, {
    responseType: "blob",
  });
};
