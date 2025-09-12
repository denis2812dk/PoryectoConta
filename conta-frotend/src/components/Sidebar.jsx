import React from "react";
import {
  Drawer, Toolbar, Box, List, ListItemButton, ListItemIcon, ListItemText, Divider
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck"; 
import AccountTreeIcon from "@mui/icons-material/AccountTree"; 
import SearchIcon from "@mui/icons-material/Search"; 
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";

const items = [
  { label: "Home", to: "/", icon: <HomeIcon /> },
  { label: "Asientos", to: "/asientos", icon: <PlaylistAddCheckIcon /> },
  { label: "Catálogo de Cuentas", to: "/catalogo", icon: <AccountTreeIcon /> },
  { label: "Consultas", to: "/consultas", icon: <SearchIcon /> },
  { label: "Libro Diario", to: "/libro-diario", icon: <MenuBookIcon /> },
  { label: "Libro Mayor", to: "/libro-mayor", icon: <ImportContactsIcon /> },
];
export default function Sidebar({ open, onClose, drawerWidth = 260, variant = "persistent" }) {
  const { pathname } = useLocation();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant={variant}
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #0d47a1 0%, #1565c0 100%)",
          color: "white",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflowY: "auto", height: "100%" }}>
        <Box sx={{ px: 2, py: 1, fontWeight: 600, opacity: 0.9 }}>
          Sistema Contable
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

        <List>
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <ListItemButton
                key={it.to}
                component={NavLink}
                to={it.to}
                onClick={variant === "temporary" ? onClose : undefined}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  ...(active
                    ? { bgcolor: "rgba(255,255,255,0.15)" }
                    : { "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }),
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                  {it.icon}
                </ListItemIcon>
                <ListItemText
                  primary={it.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
