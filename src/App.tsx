import { Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import ProductoDetalle from "./pages/ProductoDetalle";
import Fabricacion from "./pages/Fabricacion";
import Invernaderos from "./pages/Invernaderos";
import SobreAgroaper from "./pages/SobreAgroaper";
import Contacto from "./pages/Contacto";
import Legal from "./pages/Legal";
import Admin from "./pages/Admin";
import AdminDetalle from "./pages/AdminDetalle";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ChatWidget } from "./components/ChatWidget";
import { RelevanceChatEmbed, hasRelevanceChat } from "./components/RelevanceChatEmbed";

/** Sube arriba al cambiar de ruta; respeta anclas como /contacto#presupuesto. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

const PUBLIC_PREFIXES = ["/admin", "/login"];

export default function App() {
  const { pathname } = useLocation();
  const isAdminArea = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      <ScrollManager />
      {!isAdminArea && <SiteHeader />}
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:slug" element={<ProductoDetalle />} />
          <Route path="/fabricacion" element={<Fabricacion />} />
          <Route path="/invernaderos" element={<Invernaderos />} />
          <Route path="/sobre-agroaper" element={<SobreAgroaper />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/aviso-legal" element={<Legal kind="aviso" />} />
          <Route path="/privacidad" element={<Legal kind="privacidad" />} />
          <Route path="/cookies" element={<Legal kind="cookies" />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/solicitudes/:id" element={<AdminDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminArea && <SiteFooter />}
      {!isAdminArea &&
        (hasRelevanceChat ? <RelevanceChatEmbed /> : <ChatWidget />)}
    </>
  );
}
