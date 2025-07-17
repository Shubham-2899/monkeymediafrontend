import React, { useState, useEffect } from "react";
import { apiPost } from "../../utils/api";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
  Box,
  CircularProgress,
  Collapse,
  Alert,
  IconButton,
  FormLabel,
} from "@mui/material";
import "./CreateLink.css";
import CloseIcon from "@mui/icons-material/Close";
import { encrypt } from "../../utils/crypto";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

interface CreateLinkProps {}

const CreateLink: React.FC<CreateLinkProps> = () => {
  const [domain, setDomain] = useState<string>("");
  const [offerId, setOfferId] = useState<string>("");
  const [linkPattern, setLinkPattern] = useState<string>("");
  const [redirectLink, setRedirectLink] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [linkType, setLinkType] = useState<string>("Subscribe link");
  const [campaignId, setCampaignId] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "success" as "success" | "error",
    message: "",
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (alert.open) {
      interval = setTimeout(() => {
        setAlert({
          open: false,
          severity: "success" as "success" | "error",
          message: "",
        });
      }, 3000);
    }
    return () => clearTimeout(interval);
  }, [alert]);

  const handleAddOffer = async () => {
    if (!domain || !offerId || !linkPattern || !redirectLink) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please fill all required fields.",
      });
      return;
    }
    setLoading(true);

    try {
      const response = await apiPost("/url", {
        url: redirectLink,
        offerId: offerId,
        domain: domain,
        linkPattern: linkPattern,
        linkType: linkType,
        campaignId: campaignId,
      });
      setGeneratedLink(response.data.finalRedirectLink);
      console.log(`Generated Link: ${response.data.finalRedirectLink}`);
      setAlert({
        open: true,
        severity: "success",
        message: "Link Generated Successfully!",
      });
    } catch (error) {
      console.error("Error creating offer link:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to generate the link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrackLinkCreation = () => {
    if (!domain || !offerId || !campaignId) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please fill all required fields.",
      });
      return;
    }
    setLoading(true);

    try {
      const param = `campaignId=${campaignId}&offerId=${offerId}`;
      const urlEncodedParam = encrypt(param);
      setGeneratedLink(`${domain}/content/${urlEncodedParam}`);
      console.log(
        `Generated Open track Link: ${domain}/content/${urlEncodedParam}`
      );
      setAlert({
        open: true,
        severity: "success",
        message: "Link Generated Successfully!",
      });
    } catch (error) {
      console.error("Error creating open track link:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to generate the link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        (err) => console.error("Failed to copy the link: ", err)
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 700,
        mx: "auto",
        mt: 4,
        px: { xs: 1, sm: 2 },
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <LinkIcon sx={{ fontSize: 36, color: "#1976d2" }} />
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#222"
            textAlign="center"
          >
            Create Offer Link
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#666", textAlign: "center", fontWeight: 400 }}
          >
            Generate tracking and redirect links for your campaigns
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          background: "#fff",
          borderRadius: 3,
          p: { xs: 2, sm: 4 },
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          mb: 4,
        }}
      >
        <Collapse in={alert.open} sx={{ mb: 3 }}>
          <Alert
            severity={alert.severity}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlert({ ...alert, open: false })}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {alert.message}
          </Alert>
        </Collapse>

        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (linkType === "Open Track link") {
              handleOpenTrackLinkCreation();
            } else {
              handleAddOffer();
            }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Link Type
                </FormLabel>
                <Select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    background: "#f8f9fa",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e0e0e0",
                    },
                  }}
                >
                  <MenuItem value="Subscribe link">Subscribe</MenuItem>
                  <MenuItem value="Unsubscribe link">Unsubscribe</MenuItem>
                  <MenuItem value="Open Track link">Open Track</MenuItem>
                </Select>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Domain *
                </FormLabel>
                <TextField
                  required
                  size="small"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="https://healthcare.info"
                  fullWidth
                  sx={{
                    background: "#f8f9fa",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Campaign ID *
                </FormLabel>
                <TextField
                  required
                  size="small"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  placeholder="Affiliate Campaign ID"
                  fullWidth
                  sx={{
                    background: "#f8f9fa",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Offer ID *
                </FormLabel>
                <TextField
                  required
                  size="small"
                  value={offerId}
                  onChange={(e) => setOfferId(e.target.value)}
                  placeholder="Enter Offer ID"
                  fullWidth
                  sx={{
                    background: "#f8f9fa",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Link Pattern *
                </FormLabel>
                <TextField
                  required
                  size="small"
                  value={linkPattern}
                  onChange={(e) => setLinkPattern(e.target.value)}
                  placeholder="/abc123/xyz456"
                  fullWidth
                  disabled={linkType === "Open Track link"}
                  sx={{
                    background: "#f8f9fa",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                    "& .Mui-disabled": {
                      background: "#f5f5f5",
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Redirect Link *
                </FormLabel>
                <TextField
                  required
                  size="small"
                  value={redirectLink}
                  onChange={(e) => setRedirectLink(e.target.value)}
                  placeholder="https://example.com/redirect"
                  fullWidth
                  disabled={linkType === "Open Track link"}
                  sx={{
                    background: "#f8f9fa",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                    "& .Mui-disabled": {
                      background: "#f5f5f5",
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(25, 118, 210, 0.08)",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(25, 118, 210, 0.12)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Generate Link"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Generated Link Display */}
        {generatedLink && (
          <Box
            sx={{
              mt: 4,
              background: "#f8f9fa",
              borderRadius: 2,
              p: 3,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" fontWeight={600} color="#333" gutterBottom>
              Generated Link
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontFamily: "monospace",
                  background: "white",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  wordBreak: "break-all",
                }}
              >
                {generatedLink}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleCopyToClipboard}
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  minWidth: 100,
                }}
                color={copied ? "success" : "primary"}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CreateLink;
