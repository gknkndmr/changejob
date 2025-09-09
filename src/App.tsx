// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Profil from "./pages/Profil";
import OfferForm from "./pages/OfferForm"; // <— ÖNEMLİ: tam bu yol

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/teklif" element={<OfferForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
