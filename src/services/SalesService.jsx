// src/services/SalesService.js
import api from "./Api";

const SalesService = {
  createSale: (saleRequest) => api.post("/api/sales", saleRequest),
  getSales: (page = 0, size = 20) => api.get("/api/sales", { params: { page, size } }),
  getSaleById: (id) => api.get(`/api/sales/${id}`),
};

export default SalesService;
