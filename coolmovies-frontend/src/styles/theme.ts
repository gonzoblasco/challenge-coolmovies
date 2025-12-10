import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6200EA', // Deep Purple A700
            light: '#9D46FF',
            dark: '#0A00B6',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FFD740', // Amber A200
            light: '#FFFF74',
            dark: '#C8A600',
            contrastText: '#000000',
        },
        background: {
            default: '#0F0F13', // Very dark purple/grey
            paper: '#1D1D26', // Slightly lighter
        },
        text: {
            primary: '#F3F3F5',
            secondary: 'rgba(243, 243, 245, 0.7)',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
        },
        h3: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '0.25px',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12, // More rounded
                    textTransform: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    padding: '8px 24px',
                },
                containedPrimary: {
                    boxShadow: '0 4px 12px rgba(98, 0, 234, 0.4)', // Purple glow
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(98, 0, 234, 0.6)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.05)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.1)',
                }
            }
        },
        MuiRating: {
            styleOverrides: {
                iconFilled: {
                    color: '#FFD740', // Amber
                },
                iconHover: {
                    color: '#FFFF74',
                }
            }
        }
    },
});

theme = responsiveFontSizes(theme);

export default theme;
