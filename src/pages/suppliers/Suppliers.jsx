// src/pages/suppliers/Suppliers.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/Suppliers.css";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api"; // ✅ Use central API instance (axios preconfigured)

const PAGE_SIZE = 6; // 6 rows per page

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    isActive: true,
  });
  const [toast, setToast] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  // ✅ Simple toast utility
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ Load suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ✅ Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setSuppliers(list);
      setPage(0);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      showToast("Failed to fetch suppliers", "error");
    }
  };

  // ✅ Form input handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Add or Update Supplier
  const handleAddOrUpdateSupplier = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      showToast("Please fill all required fields!", "error");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || "",
      address: formData.address?.trim() || null,
      contactPerson: formData.contactPerson?.trim() || null,
      isActive: formData.isActive,
    };

    try {
      if (editingSupplier) {
        const res = await api.put(`/suppliers/${editingSupplier.id}`, payload);
        const updated = res.data?.data || res.data;
        setSuppliers((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        showToast("Supplier updated successfully!", "success");
      } else {
        const res = await api.post("/suppliers", payload);
        const created = res.data?.data || res.data;
        setSuppliers((prev) => [...prev, created]);
        showToast("Supplier added successfully!", "success");
      }

      handleCancel();
    } catch (err) {
      console.error("Error saving supplier:", err);
      const msg =
        err.response?.data?.data ??
        err.response?.data?.message ??
        "Failed to save supplier.";
      showToast(msg, "error");
    }
  };

  // ✅ Edit supplier
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone || "",
      address: supplier.address || "",
      contactPerson: supplier.contactPerson || "",
      isActive: supplier.isActive ?? true,
    });
    setShowForm(true);
  };

  // ✅ Delete supplier
  const handleDelete = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?"))
      return;

    try {
      await api.delete(`/suppliers/${supplierId}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
      showToast("Supplier deleted successfully!", "success");

      // adjust pagination if needed
      setTimeout(() => {
        const totalAfter = filteredSuppliers.length - 1;
        const totalPagesAfter = Math.max(1, Math.ceil(totalAfter / PAGE_SIZE));
        if (page >= totalPagesAfter) setPage(Math.max(0, totalPagesAfter - 1));
      }, 0);
    } catch (err) {
      console.error("Error deleting supplier:", err);
      showToast("Failed to delete supplier", "error");
    }
  };

  // ✅ Reset form
  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      isActive: true,
    });
  };

  // ✅ Search filter
  const filteredSuppliers = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      Object.values(s || {})
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [suppliers, searchTerm]);

  // ✅ Pagination logic
  const total = filteredSuppliers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const startIdx = safePage * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filteredSuppliers.slice(startIdx, endIdx);

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
    <div className="suppliers-page">
      <Sidebar />

      <div className="main-content">
        <header className="navbar">
          <h1>Suppliers</h1>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            ➕ Add Supplier
          </button>
        </header>

        <div
          style={{
            marginBottom: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search suppliers..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            style={{ flex: 1 }}
          />
        </div>

        {/* ✅ Supplier Table */}
        <section className="supplier-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>CONTACT</th>
                <th>ADDRESS</th>
                <th>ACTIVE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 16 }}>
                    No suppliers found
                  </td>
                </tr>
              ) : (
                pageItems.map((supplier, index) => (
                  <tr key={supplier.id ?? startIdx + index}>
                    <td>{startIdx + index + 1}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.contactPerson || "-"}</td>
                    <td>{supplier.address || "-"}</td>
                    <td>{supplier.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(supplier)}
                      >
                        ✏ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ✅ Pagination */}
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
              <button
                onClick={handlePrev}
                disabled={safePage === 0}
                className="btn"
              >
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

        {/* ✅ Supplier Modal Form */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h3>
              <form onSubmit={handleAddOrUpdateSupplier}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Contact Person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active
                </label>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    {editingSupplier ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Toast Notification */}
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
    </div>
  );
};

export default Suppliers;
