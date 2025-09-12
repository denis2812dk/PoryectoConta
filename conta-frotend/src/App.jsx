import React from "react";
import {
  CssBaseline, AppBar, Toolbar, Typography, IconButton, Box, useMediaQuery
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/SideBar";

import Home from "./pages/Home";
import Asientos from "./pages/Asientos";
import Catalogo from "./pages/CatalogoCuentas";
import Consultas from "./pages/Consultas";
import LibroDiario from "./pages/LibroDiario";
import LibroMayor from "./pages/LibroMayor";

const drawerWidth = 260;

export default function App() {
  const [open, setOpen] = React.useState(true);
  const isMobile = useMediaQuery("(max-width:900px)");

  React.useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const toggle = () => setOpen((v) => !v);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "primary.main"
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>Mini Conta Portable</Typography>
        </Toolbar>
      </AppBar>

      <Sidebar
        open={open}
        onClose={toggle}
        drawerWidth={drawerWidth}
        variant={isMobile ? "temporary" : "persistent"}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ...(open && !isMobile ? { ml: `${drawerWidth}px` } : {})
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/asientos" element={<Asientos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/libro-diario" element={<LibroDiario />} />
          <Route path="/libro-mayor" element={<LibroMayor />} />
        </Routes>
      </Box>
    </Box>
  );
}