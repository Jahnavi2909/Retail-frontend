// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LogoSmall from "./LogoSmall";
import "./sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  // open inventory group if current path starts with /inventory
  const [inventoryOpen, setInventoryOpen] = useState(location.pathname.startsWith("/inventory"));

  // sync when route changes (so direct link /inventory/... opens the group)
  useEffect(() => {
    if (location.pathname.startsWith("/inventory")) setInventoryOpen(true);
  }, [location.pathname]);

  const toggleInventory = () => setInventoryOpen((v) => !v);

  const linkClass = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        {/* <LogoSmall text="Acme" /> */}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={linkClass} end>
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/orders" className={linkClass}>
          <span className="nav-icon">💳</span>
          <span>Sales</span>
        </NavLink>

        <NavLink to="/products" className={linkClass}>
          <span className="nav-icon">📦</span>
          <span>Products</span>
        </NavLink>

        {/* Inventory group parent (toggle) */}
        <div className={`nav-group-parent ${inventoryOpen ? "open" : ""}`}>
          <button
            type="button"
            className={`nav-item inventory-parent ${inventoryOpen ? "active" : ""}`}
            onClick={toggleInventory}
            aria-expanded={inventoryOpen}
            aria-controls="inventory-submenu"
          >
            <span className="nav-icon">📚</span>
            <span>Inventory</span>
            <span className="chev" aria-hidden style={{ marginLeft: "auto" }}>
              {inventoryOpen ? "▾" : "▸"}
            </span>
          </button>

          <div id="inventory-submenu" className={`nav-group ${inventoryOpen ? "open" : "closed"}`}>
            <NavLink
              to="/inventory/stock-by-product"
              className={({ isActive }) => (isActive ? "nav-item sub active" : "nav-item sub")}
            >
              <span className="nav-icon">📊</span>
              <span>Stock by Product</span>
            </NavLink>
          
             <NavLink to="/inventory/add-batch"
              className={({ isActive }) => (isActive ? "nav-item sub active" : "nav-item sub")}
>             <span className="nav-icon">➕</span>
              <span>Add Batch</span>
              </NavLink>
            <NavLink
              to="/inventory/all-stock"
              className={({ isActive }) => (isActive ? "nav-item sub active" : "nav-item sub")}
            >
              <span className="nav-icon">📁</span>
              <span>All Stock</span>
            </NavLink>

           
          </div>
        </div>

        <NavLink to="/manager" className={linkClass}>
          <span className="nav-icon">👨‍💼</span>
          <span>Manager Dashboard</span>
        </NavLink>

        <NavLink to="/cashier" className={linkClass}>
          <span className="nav-icon">👩‍💼</span>
          <span>Cashier Dashboard</span>
        </NavLink>

        <NavLink to="/reports" className={linkClass}>
          <span className="nav-icon">📈</span>
          <span>Reports</span>
        </NavLink>
      </nav>
    </aside>
  );
}
