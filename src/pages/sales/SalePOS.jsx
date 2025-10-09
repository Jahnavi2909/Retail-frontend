// src/pages/sales/SalePOS.js
import React, { useState } from "react";
import ProductsService from "../../services/ProductsService";

import salesService from "../../services/SalesService";

/*
POS: search -> add -> cart -> checkout
*/
export default function SalePOS() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);

  const search = async () => {
    try {
      const res = await ProductsService.search({ name: term, sku: term, page: 0, size: 10 });
      const content = res.data?.data?.content || res.data?.data || [];
      setResults(content);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product) => {
    setCart((c) => {
      const found = c.find((x) => x.productId === product.id);
      if (found) return c.map((x) => (x.productId === product.id ? { ...x, quantity: x.quantity + 1 } : x));
      return [...c, { productId: product.id, name: product.name, quantity: 1, unitPrice: product.unitPrice, taxRate: product.taxRate }];
    });
  };

  const removeFromCart = (productId) => setCart((c) => c.filter((x) => x.productId !== productId));

  const subtotal = cart.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const tax = cart.reduce((s, it) => s + (it.unitPrice * it.quantity * (it.taxRate || 0)) / 100, 0);
  const total = subtotal + tax;

  const checkout = async (paymentMode = "CASH") => {
    const saleRequest = {
      cashierId: 1, // demo; replace with logged-in user
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate })),
      paymentMode,
      discountTotal: 0,
    };
    try {
      const res = await salesService.createSale(saleRequest);
      alert("Sale created: " + JSON.stringify(res.data));
      setCart([]);
    } catch (err) {
      alert("Error creating sale: " + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page pos">
      <div className="pos-left">
        <div className="search">
          <input placeholder="Scan or search product..." value={term} onChange={(e) => setTerm(e.target.value)} />
          <button onClick={search}>Search</button>
        </div>
        <ul className="results">
          {results.map((r) => (
            <li key={r.id}>
              {r.name} â€” â‚¹{r.unitPrice} <button onClick={() => addToCart(r)}>Add</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="pos-right">
        <h3>Cart</h3>
        <ul>
          {cart.map((c) => (
            <li key={c.productId}>
              {c.name} Ã— {c.quantity} â€” â‚¹{(c.unitPrice * c.quantity).toFixed(2)}{" "}
              <button onClick={() => removeFromCart(c.productId)}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="totals">
          <div>Subtotal: â‚¹{subtotal.toFixed(2)}</div>
          <div>Tax: â‚¹{tax.toFixed(2)}</div>
          <div>Total: â‚¹{total.toFixed(2)}</div>
        </div>
        <div className="payments">
          <button onClick={() => checkout("CASH")}>Pay Cash</button>
          <button onClick={() => checkout("CARD")}>Pay Card</button>
        </div>
      </div>
    </div>
  );
}
