import React from "react";
import {
  CssBaseline, AppBar, Toolbar, Typography, IconButton, Box, useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar"

import Asientos from "./pages/Asientos";
import Catalogo from "./pages/CatalogoCuentas";
import Consultas from "./pages/Consultas";
import Home from "./pages/Home";
import LibroDiario from "./pages/LibroDiario";
import LibroMayor from "./pages/LibroMayor";
import BalanceComprobacion from "./pages/BalanceComprobacion";
import EstadosFinancieros from "./pages/EstadosFinancieros";


const drawerWidth = 260;

export default function App() {
  const [open, setOpen] = React.useState(true);
  const isMobile = useMediaQuery("(max-width:900px)");
  const location = useLocation();
  const isHome = location.pathname === "/";

  React.useEffect(() => { setOpen(!isMobile); }, [isMobile]);
  const toggle = () => setOpen(v => !v);

  const sidebarOpen = isHome ? true : open;
  const sidebarVariant = isHome ? "permanent" : (isMobile ? "temporary" : "permanent");
  const showToggleButton = !isHome;
  //const applyLeftMargin = sidebarOpen && sidebarVariant === "persistent";

  const layoutConfig = {
    "/": { noPadding: true, bg: "transparent" },
    "/Catalogo": { noPadding: true, bg: "transparent" },
    default: { noPadding: false, padding: { xs: 2, sm: 2.5, md: 3 }, bg: "transparent" },
  };
  const pageOpts = layoutConfig[location.pathname] || layoutConfig.default;

  const applyLeftMargin = !isHome && sidebarOpen && sidebarVariant === "persistent";

  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh", boxSizing: "border-box", marginRight: "8px" }}>
      <CssBaseline />

      {!isHome && (
        <Sidebar
          open={sidebarOpen}
          onClose={showToggleButton ? toggle : undefined}
          drawerWidth={drawerWidth}
          variant={sidebarVariant}
        />
      )}


      {showToggleButton && (
        <IconButton
          onClick={toggle}
          aria-label="Abrir menú"
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: (t) => t.zIndex.drawer + 2,
            bgcolor: "#ffffff",
            border: "1px solid #E5E7EB",
            boxShadow: 1
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          bgcolor: pageOpts.bg,
          p: pageOpts.noPadding ? 0 : (pageOpts.padding || { xs: 2, sm: 2.5, md: 3 }),
          //ml: applyLeftMargin ? `${drawerWidth}px` : 0,
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Asientos" element={<Asientos />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          <Route path="/Consultas" element={<Consultas />} />
          <Route path="/LibroDiario" element={<LibroDiario />} />
          <Route path="/LibroMayor" element={<LibroMayor />} />
          <Route path="/balance-comprobacion" element={<BalanceComprobacion />} />
          <Route path="/estados" element={<EstadosFinancieros />} />
          <Route path="*" element={<h1>404 – No encontrado</h1>} />
        </Routes>
      </Box>
    </Box>
  );
}