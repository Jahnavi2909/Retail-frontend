// src/pages/inventory/AddBatch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles.css";
import InventoryService from "../../services/InventoryService";
import * as ProductsService from "../../services/ProductsService";

export default function AddBatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    costPrice: "",
    expiryDate: "",
    createdAt: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]); // simple product list for select

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function onCancel() {
    navigate(-1);
  }

  // load a small product list for the dropdown so user can pick a product.
  // adjust to your API (here: first page, 100 items)
  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        const resp = await ProductsService.getProducts(0, 100);
        const list = (resp && resp.content) ? resp.content : [];
        if (mounted) setProducts(list);
      } catch (err) {
        console.warn("Could not load products for AddBatch dropdown", err);
      }
    }
    loadProducts();
    return () => (mounted = false);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.productId) {
      alert("Please select a product");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        productId: form.productId,
        quantity: Number(form.quantity) || 0,
        costPrice: Number(form.costPrice) || 0,
        expiryDate: form.expiryDate || null,
        createdAt: form.createdAt,
        location: form.location || null,
      };

      await InventoryService.createBatch(payload);

      // navigate to stock page for this product
      navigate(`/inventory/stock-by-product?productId=${encodeURIComponent(form.productId)}`);
    } catch (err) {
      console.error("Add batch failed", err);
      alert("Failed to add batch. See console for details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <header className="page-header">
          <h2>Add Batch</h2>
        </header>

        <div className="add-batch-shell">
          <div className="form-card">
            <form className="batch-form" onSubmit={onSubmit}>
              <div className="grid-2">
                <label>
                  ID
                  <input type="text" name="id" placeholder="Auto-generated" readOnly value="" />
                </label>

                <label>
                  Product
                  <select name="productId" value={form.productId} onChange={onChange}>
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id ?? p.sku} value={p.id ?? p.sku}>
                        {p.name} {p.sku ? `(${p.sku})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid-2">
                <label>
                  Quantity
                  <input type="number" name="quantity" value={form.quantity} onChange={onChange} placeholder="Enter Quantity" />
                </label>

                <label>
                  Cost Price
                  <input type="number" name="costPrice" value={form.costPrice} onChange={onChange} placeholder="$ 0.00" step="0.01" />
                </label>
              </div>

              <div className="grid-2">
                <label>
                  Expiry Date
                  <input type="date" name="expiryDate" value={form.expiryDate} onChange={onChange} />
                </label>

                <label>
                  Created At
                  <input type="date" name="createdAt" value={form.createdAt} onChange={onChange} />
                </label>
              </div>

              <label className="full-width">
                Location
                <input type="text" name="location" value={form.location} onChange={onChange} placeholder="Enter Location" />
              </label>

              <div className="form-actions form-actions-right">
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Adding…" : "Add Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
