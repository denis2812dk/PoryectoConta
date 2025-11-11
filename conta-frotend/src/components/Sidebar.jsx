import React from "react";
import {
  Drawer, Toolbar, Box, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Tooltip, IconButton, Typography
} from "@mui/material";
import { NavLink } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const navItems = [
  { label: "Home", to: "/", icon: <HomeIcon /> },
  { label: "ASIENTOS", to: "/Asientos", icon: <PlaylistAddCheckIcon /> },
  { label: "CATÁLOGO DE CUENTAS", to: "/Catalogo", icon: <AccountTreeIcon /> },
  { label: "CONSULTAS", to: "/Consultas", icon: <SearchIcon /> },
  { label: "LIBRO DIARIO", to: "/LibroDiario", icon: <MenuBookIcon /> },
  { label: "LIBRO MAYOR", to: "/LibroMayor", icon: <ImportContactsIcon /> },
  // 🔽 nuevos
  { label: "BALANCE DE COMPROBACIÓN", to: "/balance-comprobacion", icon: <TableChartOutlinedIcon /> },
  { label: "ESTADOS FINANCIEROS", to: "/estados", icon: <AssessmentOutlinedIcon /> },
];

export default function Sidebar({
  open,
  onClose,
  drawerWidth = 260,
  variant = "persistent",
}) {
  const miniWidth = 72;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant={variant}
      anchor="left"
      sx={{
        width: open ? drawerWidth : miniWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : miniWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          color: "#0B1220",
        },
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          gap: 1,
        }}
      >
        {open ? (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
              Sistema Contable
            </Typography>
            {variant === "persistent" && (
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: "#0B1220", "&:hover": { bgcolor: "#F3F4F6" } }}
                aria-label="Cerrar sidebar"
              >
                <ChevronLeftIcon />
              </IconButton>
            )}
          </>
        ) : (
          <Box
            sx={{
              width: 32, height: 32, borderRadius: "50%",
              bgcolor: "rgba(0,0,0,0.06)",
            }}
          />
        )}
      </Toolbar>

      <Divider sx={{ borderColor: "#F3F4F6" }} />

      <Box sx={{ py: 1 }}>
        <List sx={{ px: open ? 1 : 0.5 }}>
          {navItems.map((it) => (
            <Tooltip
              key={it.to}
              title={!open ? it.label : ""}
              placement="right"
              enterDelay={400}
            >
              <ListItemButton
                component={NavLink}
                to={it.to}
                onClick={variant === "temporary" ? onClose : undefined}
                sx={{
                  mx: open ? 1 : 0.5,
                  mb: 0.5,
                  borderRadius: 2,
                  gap: open ? 1 : 0,
                  "&.active": {
                    color: "#FFFFFF",
                    bgcolor: "#313659",
                  },
                  "&:hover": {
                    bgcolor: "#F1F5F9", // <- corrige el valor inválido anterior
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 0, mr: open ? 1.5 : 0 }}>
                  {it.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: open ? 2 : 1, opacity: 0.85 }}>
        {open ? (
          <Typography variant="caption">
            © {new Date().getFullYear()} La Parada Digital 2025
          </Typography>
        ) : (
          <Typography variant="caption"></Typography>
        )}
      </Box>
    </Drawer>
  );
}
