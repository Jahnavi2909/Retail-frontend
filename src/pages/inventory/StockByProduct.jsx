// src/pages/inventory/StockByProduct.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles.css";
import InventoryService from "../../services/InventoryService";
import * as ProductsService from "../../services/ProductsService";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function StockByProduct() {
  const query = useQuery();
  const productId = query.get("productId") || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!productId) {
        setRows([]);
        return;
      }
      setLoading(true);
      try {
        // fetch batches for product
        const res = await InventoryService.getStockByProduct(productId);
        
        // assume response shape: { content: [ { batchNumber, quantity, costPrice, expiryDate, location, createdAt } ] }
        const content = (res && (res.content || res)) || [];
        if (mounted) setRows(Array.isArray(content) ? content : []);
        console.log(rows);
      } catch (err) {
        console.error("Failed to load stock for product:", err);
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // try to also fetch product details for header (optional)
    async function loadProduct() {
      try {
        if (productId && ProductsService.getProduct) {
          const p = await ProductsService.getProduct(productId);
          setProduct(p || null);
        }
      } catch (err) {
        // ignore
      }
    }

    loadProduct();
    load();
    return () => (mounted = false);
  }, [productId]);

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <header className="page-header">
          <div>
            <h2>Stock by Product</h2>
            <p className="page-subtitle">Batch-level stock for product {product ? `— ${product.name}` : (productId ? `(${productId})` : "")}</p>
          </div>

          <div className="header-actions">
            <Link to="/inventory/add-batch" className="btn-primary">+ Add Batch</Link>
          </div>
        </header>

        <section className="stock-container">
          <div className="search-bar">
            <input
              type="text"
              className="search-input full-width"
              placeholder="Filter batches..."
              onChange={(e) => {
                const q = e.target.value.trim().toLowerCase();
                // simple client-side filter
                if (!q) {
                  // reload original data
                  setRows((r) => [...r]);
                } else {
                  setRows((r) => r.filter(row => {
                    const checks = [
                      (row.batchNumber || "").toString().toLowerCase(),
                      (row.location || "").toString().toLowerCase(),
                      (row.createdAt || "").toString().toLowerCase(),
                    ];
                    return checks.some(s => s.includes(q));
                  }));
                }
              }}
            />
          </div>

          <div className="card table-card">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>BATCH NUMBER</th>
                  <th>QUANTITY</th>
                  <th>COST</th>
                  <th>EXPIRY DATE</th>
                  <th>LOCATION</th>
                  <th>CREATED AT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="empty-state">Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No stock data available. 
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.batchNumber ?? r.id ?? idx}>
                      <td>{r.batchNumber ?? r.id ?? `BATCH-${idx+1}`}</td>
                      <td style={{ textAlign: "right" }}>{r.quantity ?? r.qty ?? 0}</td>
                      <td style={{ textAlign: "right" }}>{r.costPrice != null ? Number(r.costPrice).toFixed(2) : ""}</td>
                      <td>{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : ""}</td>
                      <td>{r.location || ""}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
