import { createTheme } from "@mui/material/styles";

/**
 * "Editorial paper" brand palette: warm paper, ink navy (from the RASPIX logo),
 * and airmail red/blue used sparingly as accents.
 */
export const PAPER = {
  paper: "#f5f1ea",
  paper2: "#ece6db",
  card: "#fffdf8",
  ink: "#14213d",
  ink2: "#3d4a63",
  muted: "#6b7285",
  rule: "rgba(20,33,61,0.14)",
  stamp: "#c8553d",
  airmail: "#1f4e8c",
} as const;

/** Headings: Roboto (name kept for the heading role). */
export const FONT_SERIF = '"Roboto", "Helvetica Neue", Arial, sans-serif';
export const FONT_SANS = '"Roboto", "Helvetica Neue", Arial, sans-serif';
export const FONT_MONO = '"Roboto Mono", ui-monospace, monospace';

export const paperTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: PAPER.ink, contrastText: PAPER.paper },
    secondary: { main: PAPER.airmail },
    error: { main: PAPER.stamp },
    background: { default: PAPER.paper, paper: PAPER.card },
    text: { primary: PAPER.ink, secondary: PAPER.ink2 },
    divider: PAPER.rule,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: FONT_SANS,
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 2 },
        containedPrimary: {
          background: PAPER.ink,
          "&:hover": { background: "#22315a" },
        },
        outlinedPrimary: {
          borderColor: PAPER.ink,
          "&:hover": { borderColor: PAPER.ink, background: "rgba(20,33,61,0.05)" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: PAPER.card,
          "& fieldset": { borderColor: "rgba(20,33,61,0.25)" },
          "&:hover fieldset": { borderColor: "rgba(20,33,61,0.5)" },
        },
      },
    },
  },
});

/** Plain paper card: hairline border and a flat offset shadow, no blur or glow. */
export const paperPanelSx = {
  background: PAPER.card,
  border: `1px solid ${PAPER.ink}`,
  boxShadow: "6px 6px 0 rgba(20,33,61,0.1)",
} as const;
