// src/pages/cashier/CashierDashboard.jsx
import React, { useEffect, useState } from "react";
import "../../styles/CashierDashboard.css";
import "../../styles/SalePOS.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import api from "../../services/Api"; // ✅ using centralized API instance

const TX_PAGE_SIZE = 2; // pagination for recent transactions
const PROD_PAGE_SIZE = 3; // pagination for top products

const formatCurrency = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return String(v);
  return `₹${n.toFixed(2)}`;
};

// extract payload robustly
const extractReportPayload = (res) => {
  const envelope = res?.data ?? res;
  if (envelope && envelope.data !== undefined) return envelope.data;
  return envelope;
};

const computeTotalsFromTxList = (txs) => {
  const list = Array.isArray(txs) ? txs : [];
  const totalSales = list.reduce((s, t) => {
    const value = Number(
      t?.amount ?? t?.total ?? t?.grandTotal ?? t?.gross ?? t?.totalAmount ?? 0
    );
    return s + (Number.isNaN(value) ? 0 : value);
  }, 0);
  return { totalSales, transactions: list };
};

const normalizeTransaction = (t) => {
  if (!t) return null;
  const id = t.id ?? t.transactionId ?? t.txId ?? t.saleId ?? "-";
  const date =
    t.date ?? t.transactionDate ?? t.createdAt ?? t.timestamp ?? t.saleDate ?? null;
  const amount = Number(
    t.amount ?? t.total ?? t.grandTotal ?? t.gross ?? 0
  ) || 0;
  const status = t.status ?? (t.completed ? "Completed" : "Pending") ?? "N/A";
  return { id, date, amount, status, raw: t };
};

const normalizeProduct = (p) => {
  if (!p) return null;
  return {
    id: p.id ?? p.productId ?? p._id ?? null,
    name: p.name ?? p.productName ?? "Unknown",
    unitPrice: Number(p.unitPrice ?? p.price ?? p.sellingPrice ?? 0) || 0,
    taxRate: p.taxRate ?? p.tax ?? null,
  };
};

export default function CashierDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const [dailySales, setDailySales] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState(null);

  const [txPage, setTxPage] = useState(0);
  const [prodPage, setProdPage] = useState(0);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoadingDashboard(true);
    setError(null);
    try {
      await Promise.all([
        loadProducts(),
        loadTransactionsLastTwoDays(),
        loadTodaySales(),
      ]);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  // ✅ Now using api instance instead of axios + API_BASE
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await api.get("/products?page=0&size=10");
      const payload = extractReportPayload(res);

      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.content)) list = payload.content;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(res?.data)) list = res.data;
      else list = [];

      const normalized = list.map(normalizeProduct).filter(Boolean);
      normalized.sort((a, b) => (Number(a.id ?? 0) - Number(b.id ?? 0)));

      setProducts(normalized);
      setProdPage(0);
    } catch (err) {
      console.error("loadProducts error:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadTransactionsLastTwoDays = async () => {
    setTxLoading(true);
    try {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      const res = await api.get("/reports/sales", {
        params: { from: start.toISOString(), to: end.toISOString() },
      });

      const payload = extractReportPayload(res);
      let txList = [];

      if (Array.isArray(payload)) txList = payload;
      else if (Array.isArray(payload?.transactions)) txList = payload.transactions;
      else if (Array.isArray(payload?.sales)) txList = payload.sales;
      else if (Array.isArray(payload?.records)) txList = payload.records;
      else if (Array.isArray(payload?.data)) txList = payload.data;
      else if (Array.isArray(res?.data)) txList = res.data;
      else {
        const maybeContent =
          payload?.content ?? payload?.items ?? payload?.results;
        if (Array.isArray(maybeContent)) txList = maybeContent;
      }

      const normalized = (Array.isArray(txList) ? txList : [])
        .map(normalizeTransaction)
        .filter(Boolean)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(normalized);
      setTxPage(0);
    } catch (err) {
      console.error("loadTransactionsLastTwoDays error:", err);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const loadTodaySales = async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const from = `${todayStr}T00:00:00`;
      const to = `${todayStr}T23:59:59`;

      const res = await api.get("/reports/sales", { params: { from, to } });
      const payload = extractReportPayload(res);

      if (Array.isArray(payload)) {
        const { totalSales } = computeTotalsFromTxList(payload);
        setDailySales(Number(totalSales));
        return;
      }

      if (Array.isArray(payload?.transactions)) {
        const { totalSales } = computeTotalsFromTxList(payload.transactions);
        setDailySales(Number(totalSales));
        return;
      }

      const totalFromSummary =
        Number(
          payload?.totalSales ?? payload?.total ?? payload?.grossTotal ?? 0
        ) || 0;
      if (totalFromSummary > 0) {
        setDailySales(Number(totalFromSummary));
        return;
      }

      const nested = payload?.data ?? payload?.content ?? payload?.sales ?? null;
      if (Array.isArray(nested)) {
        const { totalSales } = computeTotalsFromTxList(nested);
        setDailySales(Number(totalSales));
        return;
      }

      setDailySales(0);
    } catch (err) {
      console.error("loadTodaySales error:", err);
      setDailySales(0);
    }
  };

  const gotoPOS = () => navigate("/pos");

  const txTotal = transactions.length;
  const txTotalPages = Math.max(1, Math.ceil(txTotal / TX_PAGE_SIZE));
  const txSafePage = Math.min(Math.max(0, txPage), txTotalPages - 1);
  const txStartIdx = txSafePage * TX_PAGE_SIZE;
  const txEndIdx = Math.min(txStartIdx + TX_PAGE_SIZE, txTotal);
  const txPageRows = transactions.slice(txStartIdx, txEndIdx);

  const prodTotal = products.length;
  const prodTotalPages = Math.max(1, Math.ceil(prodTotal / PROD_PAGE_SIZE));
  const prodSafePage = Math.min(Math.max(0, prodPage), prodTotalPages - 1);
  const prodStartIdx = prodSafePage * PROD_PAGE_SIZE;
  const prodEndIdx = Math.min(prodStartIdx + PROD_PAGE_SIZE, prodTotal);
  const prodPageRows = products.slice(prodStartIdx, prodEndIdx);

  return (
    <div className="cashier-container">
      <Sidebar />

      <main className="main-content">
        <header className="header">
          <h1>Cashier Dashboard</h1>
        </header>

        <section className="sales-summary">
          <div className="sales-card">
            <h3>Today's Sales</h3>
            <p className="sales-amount">{formatCurrency(dailySales)}</p>
          </div>

          <button className="pos-button" onClick={gotoPOS} disabled={loadingDashboard}>
            Go to POS
          </button>
        </section>

        <section className="products-section" style={{ marginTop: 18 }}>
          <h2>Top Products</h2>

          {productsLoading ? (
            <p>Loading products...</p>
          ) : prodTotal === 0 ? (
            <p style={{ textAlign: "center", color: "#555" }}>No products found.</p>
          ) : (
            <>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price (₹)</th>
                    <th>Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {prodPageRows.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.unitPrice != null ? formatCurrency(p.unitPrice) : "-"}</td>
                      <td>{p.taxRate ? `${p.taxRate}%` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {prodTotal > PROD_PAGE_SIZE && (
                <div
                  className="card-footer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <div className="results">
                    Showing {prodTotal === 0 ? 0 : prodStartIdx + 1} to {prodEndIdx} of{" "}
                    {prodTotal} results
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => setProdPage((p) => Math.max(0, p - 1))}
                      disabled={prodSafePage === 0}
                      className="btn"
                    >
                      Prev
                    </button>

                    <div style={{ display: "flex", gap: 6 }}>
                      {Array.from({ length: prodTotalPages }).map((_, i) => {
                        if (prodTotalPages > 7) {
                          const start = Math.max(0, prodSafePage - 3);
                          const end = Math.min(prodTotalPages, start + 7);
                          if (i < start || i >= end) return null;
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => setProdPage(i)}
                            className={`btn ${i === prodSafePage ? "active" : ""}`}
                            style={{
                              minWidth: 36,
                              padding: "6px 8px",
                              borderRadius: 4,
                              background: i === prodSafePage ? "#1565c0" : undefined,
                              color: i === prodSafePage ? "#fff" : undefined,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setProdPage((p) => Math.min(prodTotalPages - 1, p + 1))}
                      disabled={prodSafePage >= prodTotalPages - 1}
                      className="btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
