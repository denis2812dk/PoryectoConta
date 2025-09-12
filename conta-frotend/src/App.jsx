import React from "react";
import {
  CssBaseline, AppBar, Toolbar, Typography, IconButton, Box, useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components//Sidebar"

import Asientos from "./pages/Asientos";
import Catalogo from "./pages/CatalogoCuentas";
import Consultas from "./pages/Consultas";
import Home from "./pages/Home";
import LibroDiario from "./pages/LibroDiario";
import LibroMayor from "./pages/LibroMayor";


const drawerWidth = 260;

export default function App() {
  const [open, setOpen] = React.useState(true);
  const isMobile = useMediaQuery("(max-width:900px)");

  React.useEffect(() => { setOpen(!isMobile); }, [isMobile]);
  const toggle = () => setOpen(v => !v);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />



      <Sidebar
        open={open}
        onClose={toggle}
        drawerWidth={260}
        variant={isMobile ? "temporary" : "persistent"}
      />
      <IconButton
        onClick={toggle}
        aria-label="Abrir menú"
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: (t) => t.zIndex.drawer + 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: 1
        }}
      >
        <MenuIcon />
      </IconButton>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ...(open && !isMobile ? { ml: `${drawerWidth}px` } : {})
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Asientos" element={<Asientos />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          <Route path="/Consultas" element={<Consultas />} />
          <Route path="/LibroDiario" element={<LibroDiario />} />
          <Route path="/LibroMayor" element={<LibroMayor />} />
          <Route path="*" element={<h1>404 – No encontrado</h1>} />
        </Routes>
      </Box>
    </Box>
  );
}