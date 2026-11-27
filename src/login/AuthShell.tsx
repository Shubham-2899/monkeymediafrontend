import { ReactNode } from "react";
import { Box, Paper } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import SceneBackdrop from "../components/three/SceneBackdrop";
import { FONT_MONO, FONT_SANS, FONT_SERIF, PAPER, paperPanelSx, paperTheme } from "../theme/paperTheme";
import { HOME } from "../site/content";

/** Shared layout for sign-in / reset: the paper mail scene behind a plain paper card. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={paperTheme}>
      <Box
        sx={{
          position: "relative",
          minHeight: "calc(100vh - 76px)",
          display: "flex",
          alignItems: "center",
          py: 4,
          overflow: "hidden",
          color: PAPER.ink,
          fontFamily: FONT_SANS,
        }}
      >
        <SceneBackdrop variant="login" />

        {/* line from the live site, set over the globe (desktop) */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "absolute",
            // left edge of the shared 1200px content column (+28px gutter), like the header logo
            left: "max(28px, calc(50% - 572px))",
            bottom: "8vh",
            zIndex: 1,
            maxWidth: 380,
            pointerEvents: "none",
          }}
        >
          <Box sx={{ fontFamily: FONT_MONO, fontSize: 12.5, color: PAPER.muted, mb: 1 }}>{HOME.eyebrow}</Box>
          <Box sx={{ fontFamily: FONT_SERIF, fontSize: 28, lineHeight: 1.2, fontWeight: 400 }}>{HOME.subtitle.split(".")[0]}.</Box>
        </Box>

        {/* same centred column as the header and the site pages, card pinned to its right edge */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            px: "28px",
            boxSizing: "border-box",
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              ...paperPanelSx,
              position: "relative",
              p: { xs: 3, sm: 4.5 },
              borderRadius: 0,
              width: "100%",
              maxWidth: 430,
              animation: "panel-rise 0.6s ease-out both",
            }}
          >
            {children}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
