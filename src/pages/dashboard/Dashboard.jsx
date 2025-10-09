// src/pages/dashboard/Dashboard.jsx
import Sidebar from "../../components/Sidebar";
import AdminPanel from "../../components/AdminPanel";
import "../../pages/dashboard/dashboard.css"; // page styles (you created earlier)
import { useEffect, useState } from "react";
import { getLowStocks } from "../../services/LowStock";

// Demo data (replace with API calls as needed)
const summary = {
  gross: "₹20,000",
  net: "₹18,500",
  tax: "₹1,000",
  discounts: "₹500",
};

// const lowStock = [
//   { id: 1, name: "Eco-Friendly Cleaning Spray", sku: "SKU-001", qty: 5 },
//   { id: 2, name: "Organic Baby Wipes", sku: "SKU-002", qty: 8 },
//   { id: 3, name: "Gluten-Free Pasta", sku: "SKU-003", qty: 12 },
//   { id: 4, name: "Recycled Paper Towels", sku: "SKU-004", qty: 15 },
//   { id: 5, name: "Vegan Protein Bars", sku: "SKU-005", qty: 10 },
// ];



export default function Dashboard() {

  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const resp = await getLowStocks();
      console.log(resp);
      setLowStock(lowStock)

    }

    getData();
  })

  return (
    <div className="dashboard-page">
      {/* Left sidebar */}

      <Sidebar />


      {/* Main content + right admin panel */}
      <div className="dashboard-main">
        <div className="page-title">Dashboard</div>

        <div className="dashboard-layout">
          {/* Main scrollable content */}
          <div className="dashboard-content">
            {/* KPI cards row */}
            <div className="kpi-cards">
              <div className="kpi-card">
                <div className="kpi-title">Gross Sales</div>
                <div className="kpi-value">{summary.gross}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-title">Net Sales</div>
                <div className="kpi-value">{summary.net}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-title">Tax</div>
                <div className="kpi-value">{summary.tax}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-title">Discounts</div>
                <div className="kpi-value">{summary.discounts}</div>
              </div>
            </div>

            {/* Low stock table */}
            <div className="table-card">
              <h3 className="section-title">Low Stock Products</h3>
              <div className="table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th style={{ textAlign: "right" }}>Current Stock Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td className="qty-cell">{p.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right admin panel (sticky) */}
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}
