import { createTheme } from "@mui/material/styles";
import { red, teal } from "@mui/material/colors";

// Base theme with Uizard-inspired styling
const baseTheme = {
    typography: {
        fontFamily: "'Inter', sans-serif",
        h5: {
            fontWeight: 600,
            color: (theme) => theme.palette.text.primary, // Use theme-aware color instead of hardcoded #2d3748
        },
        h6: {
            fontWeight: 600,
            color: (theme) => theme.palette.text.primary, // Use theme-aware color instead of hardcoded #2d3748
        },
        subtitle2: {
            fontWeight: 500,
            color: (theme) => theme.palette.text.secondary, // Use theme-aware color instead of hardcoded #4a5568
        },
        body1: {
            color: (theme) => theme.palette.text.secondary, // Use theme-aware color instead of hardcoded #4a5568
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
                },
            },
        },
        MuiTable: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    overflow: "hidden",
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: (theme) => theme.palette.background.paper, // Adapt to theme
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:hover": {
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light" ? "#f7fafc" : theme.palette.grey[800], // Dark mode hover
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                },
                containedPrimary: {
                    "&:hover": {
                        backgroundColor: teal[700],
                    },
                },
                containedSecondary: {
                    "&:hover": {
                        backgroundColor: red[700],
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                        backgroundColor: (theme) => theme.palette.background.paper,
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: (theme) => theme.palette.background.paper,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    "&.Mui-selected": {
                        backgroundColor: "#0044cc !important",
                        color: "#ffffff !important",
                        "& .MuiListItemIcon-root": {
                            color: "#ffffff !important",
                        },
                    },
                    "&:hover": {
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light" ? "#f7fafc" : theme.palette.grey[800],
                    },
                },
            },
        },
    },
};

// Create light and dark themes
const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: "light",
        primary: {
            main: teal[600], // Uizard-inspired teal
        },
        secondary: {
            main: red[600], // Uizard-inspired red
        },
        background: {
            default: "#f4f7fa",
            paper: "#ffffff",
        },
        text: {
            primary: "#2d3748",
            secondary: "#4a5568",
        },
    },
});

const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: "dark",
        primary: {
            main: teal[400], // Lighter teal for dark mode
        },
        secondary: {
            main: red[400], // Lighter red for dark mode
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e",
        },
        text: {
            primary: "#e0e0e0",
            secondary: "#d3d3d3",
        },
    },
});

export { lightTheme, darkTheme };