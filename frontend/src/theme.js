import { createTheme } from "@mui/material/styles";
import { red, teal } from "@mui/material/colors";

// Base theme with Uizard-inspired styling
const baseTheme = {
    typography: {
        fontFamily: "'Inter', sans-serif",
        h5: {
            fontWeight: 600,
            color: "#2d3748",
        },
        h6: {
            fontWeight: 600,
            color: "#2d3748",
        },
        subtitle2: {
            fontWeight: 500,
            color: "#4a5568",
        },
        body1: {
            color: "#4a5568",
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
                    backgroundColor: "#edf2f7",
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:hover": {
                        backgroundColor: "#f7fafc",
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
                        backgroundColor: "#fff",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#ffffff",
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
            secondary: "#b0b0b0",
        },
    },
});

export { lightTheme, darkTheme };