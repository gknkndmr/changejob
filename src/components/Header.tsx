// src/components/Header.tsx
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const item = (to: string, label: string) => (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive ? "#2563eb" : "#374151",
        fontWeight: 600,
        padding: "6px 10px",
        borderRadius: 8,
        background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
      })}
    >
      {label}
    </NavLink>
  );

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: 800,
          textDecoration: "none",
          color: "#111827",
          fontSize: 18,
        }}
      >
        ChangeJob
      </Link>

      <nav style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
        {item("/detay", "Detay")}
        {item("/kurumsal", "Kurumsal")}
        {item("/giris", "Giriş")}
      </nav>
    </header>
  );
}
