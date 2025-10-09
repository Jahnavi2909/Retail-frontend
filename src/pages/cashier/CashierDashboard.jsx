// src/pages/cashier/CashierDashboard.jsx
import React from "react";
import Sidebar from "../../components/Sidebar";
import AdminPanel from "../../components/AdminPanel"; // if you use it; otherwise omit
import "../../styles.css";

export default function CashierDashboard() {
  // demo data
  const summary = { today: "$2,450" };
  const recent = [
    { id: "#12345", date: "2024-01-15", amount: "$150.00", status: "Completed" },
    { id: "#12346", date: "2024-01-15", amount: "$200.00", status: "Completed" },
    { id: "#12347", date: "2024-01-15", amount: "$50.00", status: "Completed" },
    { id: "#12348", date: "2024-01-15", amount: "$300.00", status: "Completed" },
    { id: "#12349", date: "2024-01-15", amount: "$100.00", status: "Completed" },
  ];

  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Cashier Dashboard</h1>

        <div className="cashier-top">
          <div className="kpi-card small">
            <div className="kpi-label">Today's Sales</div>
            <div className="kpi-value">{summary.today}</div>
          </div>

          <div style={{ marginLeft: 14 }}>
            <button className="btn btn-primary">Go to POS</button>
          </div>
        </div>

        <section className="table-card">
          <h3 className="section-title">Recent Transactions</h3>
          <div className="table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.date}</td>
                    <td>{r.amount}</td>
                    <td><span className="badge badge-success">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
