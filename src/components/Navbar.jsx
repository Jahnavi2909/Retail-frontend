// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import LogoSmall from "./LogoSmall";
import { useAuth } from "../context/AuthContext";

export default function Navbar(){
  const { user, logout } = useAuth() || {};
  return (
    <header className="header">
      <div className="brand">
        <LogoSmall text="SM" />
        <div>
          <div style={{fontWeight:700}}>Small Business</div>
          <div style={{fontSize:12,opacity:0.95}}>Inventory & POS</div>
        </div>
      </div>

      {/* <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/products">Products</Link>
        <Link to="/pos">POS</Link>
      </nav> */}

      <div className="right">
        {user ? (
          <>
            <div style={{fontSize:13}}>Hi, {user.username}</div>
            {/* <button className="btn ghost small" onClick={() => logout && logout()}>Logout</button> */}
          </>
        ) : (
          <Link to="/login" className="btn small">Login</Link>
        )}
      </div>
    </header>
  );
}
