// src/pages/manager/ManagerDashboard.jsx
import React, { useEffect, useState } from "react";
import "../../styles/ManagerDashboard.css";
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api"; // ✅ Use configured Axios instance

const PAGE_SIZE = 3; // <-- 3 rows per page for recent orders

const ManagerDashboard = () => {
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [recentOrdersRaw, setRecentOrdersRaw] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setError(null);
    setLoading(true);
    try {
      // ✅ All API calls now use `api` which has baseURL + auth header
      const [supRes, poRes, lowRes] = await Promise.allSettled([
        api.get("/suppliers"),
        api.get("/purchase-orders?page=0&size=100"),
        api.get("/reports/low-stock"),
      ]);

      // Suppliers count
      if (supRes.status === "fulfilled") {
        const supList = supRes.value?.data?.data ?? supRes.value?.data ?? [];
        setSuppliersCount(Array.isArray(supList) ? supList.length : 0);
      } else {
        console.warn("fetch suppliers failed:", supRes.reason);
        setSuppliersCount(0);
      }

      // Purchase orders
      if (poRes.status === "fulfilled") {
        const poPayload = poRes.value?.data?.data ?? poRes.value?.data ?? [];
        let allOrders = Array.isArray(poPayload?.content)
          ? poPayload.content
          : Array.isArray(poPayload)
          ? poPayload
          : [];

        const isPendingStatus = (o) => {
          const status = (o.status ?? o.orderStatus ?? "").toLowerCase();
          return ["pending", "created", "awaiting", "open"].includes(status);
        };

        const pending = allOrders.filter(isPendingStatus).length;
        setPendingOrdersCount(pending);

        const normalized = allOrders
          .map((o) => ({
            id: o.id ?? o.orderId ?? Math.random().toString(36).slice(2, 9),
            poNumber: o.poNumber ?? o.orderNumber ?? "N/A",
            supplierName:
              (o.supplier && (o.supplier.name ?? o.supplierName)) ||
              o.supplierName ||
              "N/A",
            expectedDate: o.expectedDate || o.createdAt || o.orderDate || null,
            status: o.status ?? o.orderStatus ?? "Pending",
          }))
          .sort((a, b) => new Date(b.expectedDate) - new Date(a.expectedDate));

        setRecentOrdersRaw(normalized);
        setPage(0);
      } else {
        console.warn("fetch purchase-orders failed:", poRes.reason);
        setRecentOrdersRaw([]);
        setPendingOrdersCount(0);
      }

      // Low stock
      if (lowRes.status === "fulfilled") {
        const lowList = lowRes.value?.data?.data ?? lowRes.value?.data ?? [];
        setLowStockItems(Array.isArray(lowList) ? lowList.length : 0);
      } else {
        console.warn("fetch low stock failed:", lowRes.reason);
        setLowStockItems(0);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const total = recentOrdersRaw.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const startIdx = safePage * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = recentOrdersRaw.slice(startIdx, endIdx);

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toISOString().split("T")[0];
    } catch {
      return String(iso);
    }
  };

  return (
    <div className="manager-dashboard">
      <Sidebar />

      <div className="main-content">
        <header className="navbar">
          <h1>Manager Dashboard</h1>
          <div className="user-icon">🔔</div>
        </header>

        {error && <p className="error-message">{error}</p>}

        <section className="kpi-cards">
          <div className="kpi-card">
            <h3>Total Suppliers</h3>
            <p>{suppliersCount}</p>
          </div>
          <div className="kpi-card">
            <h3>Pending Orders</h3>
            <p>{pendingOrdersCount}</p>
          </div>
          <div className="kpi-card">
            <h3>Low Stock Items</h3>
            <p>{lowStockItems}</p>
          </div>
        </section>

        <section className="table-section">
          <h2>Recent Purchase Orders</h2>

          {total === 0 && !loading ? (
            <p style={{ textAlign: "center" }}>No purchase orders found.</p>
          ) : (
            <>
              <table className="recent-orders-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Order ID</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((order, idx) => (
                    <tr key={order.id}>
                      <td>{startIdx + idx + 1}</td>
                      <td>{order.poNumber}</td>
                      <td>{order.supplierName}</td>
                      <td>{formatDate(order.expectedDate)}</td>
                      <td>
                        <span className={`status ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {total > PAGE_SIZE && (
                <div className="pagination-controls">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0}>
                    Prev
                  </button>
                  <span>
                    Page {safePage + 1} of {totalPages}
                  </span>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManagerDashboard;
