import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Detay from "./pages/Detay";
import Kurumsal from "./pages/Kurumsal";
import Giris from "./pages/Giris";

export default function App() {
  return (
    <>
      {/* (İsteğe bağlı) Basit üst menü */}
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/" style={{ marginRight: 12 }}>Ana sayfa</Link>
        <Link to="/detay" style={{ marginRight: 12 }}>Detay</Link>
        <Link to="/kurumsal" style={{ marginRight: 12 }}>Kurumsal</Link>
        <Link to="/giris">Giriş</Link>
      </nav>

      {/* Router sadece burada route'ları yönetir; App içinde BrowserRouter YOK */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detay" element={<Detay />} />
        <Route path="/kurumsal" element={<Kurumsal />} />
        <Route path="/giris" element={<Giris />} />
      </Routes>
    </>
  );
}
