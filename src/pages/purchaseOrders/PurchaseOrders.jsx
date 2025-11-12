// src/pages/purchase/PurchaseOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/PurchaseOrders.css";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api"; // ✅ using centralized API instance

const PAGE_SIZE = 6; // 6 rows per page

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  const [newOrder, setNewOrder] = useState({
    orderNumber: "",
    supplierId: "",
    expectedDate: "",
    notes: "",
    status: "Pending",
  });

  const [page, setPage] = useState(0);

  // Toast Notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchSuppliers();
    fetchOrders();
  }, []);

  // ✅ fetch suppliers using `api`
  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/api/suppliers");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setSuppliers(list);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      showToast("Failed to fetch suppliers", "error");
    }
  };

  // ✅ fetch purchase orders using `api`
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/purchase-orders");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setOrders(list);
      setPage(0);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast("Failed to fetch purchase orders", "error");
    }
  };

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add or Update purchase order
  const handleAddOrUpdateOrder = async (e) => {
    e.preventDefault();

    if (!newOrder.supplierId || !newOrder.orderNumber || !newOrder.expectedDate) {
      showToast("Please fill all required fields!", "error");
      return;
    }

    const payload = {
      orderNumber: newOrder.orderNumber.trim(),
      supplierId: Number(newOrder.supplierId),
      expectedDate: newOrder.expectedDate,
      notes: newOrder.notes?.trim() || "",
      status: newOrder.status,
    };

    try {
      if (editingOrder) {
        const res = await api.put(`/api/purchase-orders/${editingOrder.id}`, payload);
        const updated = res.data?.data || res.data;
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast("Order updated successfully!", "success");
      } else {
        const res = await api.post("/api/purchase-orders", payload);
        const created = res.data?.data || res.data;
        setOrders((prev) => [...prev, created]);
        showToast("Order added successfully!", "success");
      }

      handleCancel();
    } catch (err) {
      console.error("Error saving order:", err);
      const msg =
        err.response?.data?.data ??
        err.response?.data?.message ??
        "Failed to save order.";
      showToast(msg, "error");
    }
  };

  // ✅ Delete order
  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await api.delete(`/api/purchase-orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast("Order deleted successfully!", "success");

      setTimeout(() => {
        const totalAfter = filteredOrders.length - 1;
        const totalPagesAfter = Math.max(1, Math.ceil(totalAfter / PAGE_SIZE));
        if (page >= totalPagesAfter) setPage(Math.max(0, totalPagesAfter - 1));
      }, 0);
    } catch (err) {
      console.error("Error deleting order:", err);
      showToast("Failed to delete order", "error");
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setNewOrder({
      orderNumber: order.orderNumber || "",
      supplierId: order.supplierId || "",
      expectedDate: order.expectedDate || "",
      notes: order.notes || "",
      status: order.status || "Pending",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
    setNewOrder({
      orderNumber: "",
      supplierId: "",
      expectedDate: "",
      notes: "",
      status: "Pending",
    });
  };

  // ✅ filter + pagination logic unchanged
  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) =>
      Object.values(order || {})
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, searchTerm]);

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const startIdx = safePage * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filteredOrders.slice(startIdx, endIdx);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const goToPage = (p) => setPage(Math.min(Math.max(0, p), totalPages - 1));

  const pageButtons = useMemo(() => {
    const buttons = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) buttons.push(i);
      return buttons;
    }
    let start = Math.max(0, safePage - 3);
    let end = Math.min(totalPages, start + 7);
    if (end - start < 7) start = Math.max(0, end - 7);
    for (let i = start; i < end; i++) buttons.push(i);
    return buttons;
  }, [totalPages, safePage]);

  return (
    <div className="purchase-page">
      <Sidebar />

      <div className="main-content">
        <div className="header">
          <h1>Purchase Orders</h1>
          <button className="new-order-btn" onClick={() => setShowForm(true)}>
            ➕ New Order
          </button>
        </div>

        <input
          type="text"
          placeholder="Search Purchase Orders"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />

        <table className="orders-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Expected Date</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((order, index) => (
                <tr key={order.id || startIdx + index}>
                  <td>{startIdx + index + 1}</td>
                  <td>{order.orderNumber}</td>
                  <td>
                    {suppliers.find((s) => s.id === order.supplierId)?.name ||
                      order.supplierId}
                  </td>
                  <td>{order.expectedDate}</td>
                  <td>{order.notes}</td>
                  <td>
                    <span
                      className={`status-badge ${order.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(order)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(order.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "15px" }}>
                  No matching orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {total > PAGE_SIZE && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <div className="results">
              Showing {total === 0 ? 0 : startIdx + 1} to {endIdx} of {total} results
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={handlePrev} disabled={safePage === 0} className="btn">
                Prev
              </button>

              <div style={{ display: "flex", gap: 6 }}>
                {pageButtons.map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`btn ${p === safePage ? "active" : ""}`}
                    style={{
                      minWidth: 36,
                      padding: "6px 8px",
                      borderRadius: 4,
                      background: p === safePage ? "#1565c0" : undefined,
                      color: p === safePage ? "#fff" : undefined,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={safePage >= totalPages - 1}
                className="btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingOrder ? "Edit Purchase Order" : "New Purchase Order"}</h3>
            <form onSubmit={handleAddOrUpdateOrder}>
              <input
                type="text"
                name="orderNumber"
                placeholder="PO Number"
                value={newOrder.orderNumber}
                onChange={handleChange}
                required
              />

              <select
                name="supplierId"
                value={newOrder.supplierId}
                onChange={handleChange}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="expectedDate"
                value={newOrder.expectedDate}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="notes"
                placeholder="Notes"
                value={newOrder.notes}
                onChange={handleChange}
              />
              <select
                name="status"
                value={newOrder.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingOrder ? "Update" : "Save"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded text-white shadow-md transition-all ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
