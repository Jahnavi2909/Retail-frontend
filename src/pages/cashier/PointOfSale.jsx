// src/pages/cashier/PointOfSale.jsx
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles.css";

export default function PointOfSale() {
  // demo cart data
  const [cart, setCart] = useState([
    { id: 1, name: "Organic Apples", qty: 2, price: 1.5 },
    { id: 2, name: "Whole Wheat Bread", qty: 1, price: 3.0 },
    { id: 3, name: "Almond Milk", qty: 3, price: 2.75 },
  ]);

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Point of Sale</h1>

        <div className="pos-grid">
          <div className="pos-left">
            <input className="search-input full-width" placeholder="Search products by name or barcode" />
            {/* product listing would go here */}
            <div style={{ height: 360 }} />
          </div>

          <aside className="pos-right">
            <div className="card table-card pos-cart">
              <h4>Cart</h4>
              <div className="cart-rows">
                <table className="cart-table">
                  <thead>
                    <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
                  </thead>
                  <tbody>
                    {cart.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.qty}</td>
                        <td>{(p.price * p.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cart-summary">
                  <div className="row"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
                  <div className="row"><span>Tax (10%)</span><span>{tax.toFixed(2)}</span></div>
                  <div className="row total"><span>Total</span><span>{total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className="pos-controls">
              <div className="inline-row">
                <input className="small-input" placeholder="Enter coupon code" />
                <button className="btn btn-ghost">Apply</button>
              </div>

              <div className="inline-row" style={{ marginTop: 10 }}>
                <select className="small-input">
                  <option>Cash</option>
                  <option>Card</option>
                </select>
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
                <button className="btn btn-secondary">Cancel</button>
                <button className="btn btn-primary">Finalize Sale</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
