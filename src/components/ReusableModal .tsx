import React from "react";
import { Box, Modal, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ReusableModal = ({
  open,
  handleClose,
  title,
  children,
  actions,
  icon,
  width,
  subTitle = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : width,
          maxHeight: isMobile ? "80vh" : "auto", // Limit height on mobile
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 5,
          outline: "none",
          overflowY: isMobile ? "auto" : "visible", // Enable scrolling on mobile if needed
        }}
      >
        {icon && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h6" component="h2" align="center">
          {title}
        </Typography>
        {subTitle && (
          <Typography variant="body1" component="p" align="center">
            {subTitle}
          </Typography>
        )}
        <Box
          sx={{
            mt: 2,
            maxHeight: isMobile ? "60vh" : "auto", // Set max height for content on mobile
            overflowY: "auto", // Enable scrolling within content area if content exceeds max height
          }}
        >
          {children}
        </Box>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            gap: 1,
            position: isMobile ? "sticky" : "static", // Keep actions visible on mobile
            bottom: 0,
            backgroundColor: "background.paper",
            paddingTop: 2,
          }}
        >
          {actions}
        </Box>
      </Box>
    </Modal>
  );
};

export default ReusableModal;
