// src/services/InventoryService.js
import api from "./Api";
import Cookies from "js-cookie";

function authHeaders() {
  const token = Cookies.get("sr_token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const InventoryService = {
  // Create a batch for a product
  createBatch: async (payload) => {
    // payload: { productId, quantity, costPrice, expiryDate, createdAt, location }
    const res = await api.post("/api/stock/batch", payload, {
      headers: authHeaders(),
    });
    return res.data ?? res;
  },

  // Get stock batches for a single product (server should support this)
  // Example endpoint: GET /api/inventory/stock-by-product?productId=SKU123
  getStockByProduct: async (productId) => {
    const res = await api.get(`/api/stock/${productId}`, {
      params: { productId },
      headers: authHeaders(),
    });
    return res.data ?? res;
  },
};

export default InventoryService;
export { InventoryService };
