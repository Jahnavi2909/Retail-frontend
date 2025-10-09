// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";
import SalePOS from "./pages/sales/SalePOS";
import { useAuth } from "./context/AuthContext";
import StockByProduct from "./pages/inventory/StockByProduct";
import AddBatch from "./pages/inventory/addBatch";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import PointOfSale from "./pages/cashier/PointOfSale";
import SalesReports from "./pages/cashier/SalesReports";






function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}


export default function App() {
   
  return (
    <div className="app-root">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><SalePOS /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/inventory/stock-by-product"
           element={<ProtectedRoute><StockByProduct /></ProtectedRoute>}/>
          <Route path="/inventory/add-batch" element={<ProtectedRoute><AddBatch /></ProtectedRoute>} />
          <Route path="/cashier" element={<ProtectedRoute><CashierDashboard /></ProtectedRoute>} />
          <Route path="/cashier/pos" element={<ProtectedRoute><PointOfSale /></ProtectedRoute>} />
          <Route path="/cashier/sales" element={<ProtectedRoute><SalesReports /></ProtectedRoute>} />
          <Route
  path="/products/new"
  element={
    <ProtectedRoute>
      <ProductForm />
    </ProtectedRoute>
  }
/>
<Route
  path="/products/:id/edit"
  element={
    <ProtectedRoute>
      <ProductForm />
    </ProtectedRoute>
  }
/>
<Route path="/inventory/add-batch" element={<ProtectedRoute><AddBatch/></ProtectedRoute>} />
<Route path="/inventory/stock-by-product" element={<ProtectedRoute><StockByProduct/></ProtectedRoute>} />


        </Routes>
      </main>
    </div>
  );
}

