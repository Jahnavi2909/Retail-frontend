// src/pages/cashier/SalesReports.jsx
import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles.css";

export default function SalesReports() {
  const sales = [
    { id: "#SALE5823", date: "2023-10-27", cashier: "John Doe", items: 3, net: "$15.68", tax: "$1.57" },
    { id: "#SALE5822", date: "2023-10-27", cashier: "Jane Smith", items: 5, net: "$45.50", tax: "$4.55" },
    { id: "#SALE5821", date: "2023-10-26", cashier: "John Doe", items: 2, net: "$8.99", tax: "$0.90" },
    { id: "#SALE5820", date: "2023-10-26", cashier: "Jane Smith", items: 8, net: "$120.75", tax: "$12.08" },
    { id: "#SALE5819", date: "2023-10-25", cashier: "John Doe", items: 1, net: "$2.50", tax: "$0.25" },
  ];

  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Sales List</h1>

        <div className="table-card">
          <div className="table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DATE</th>
                  <th>CASHIER</th>
                  <th>ITEMS</th>
                  <th>NET AMOUNT</th>
                  <th>TAX</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.date}</td>
                    <td>{s.cashier}</td>
                    <td>{s.items}</td>
                    <td>{s.net}</td>
                    <td>{s.tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
