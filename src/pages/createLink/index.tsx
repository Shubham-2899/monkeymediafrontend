import React, { useState, useEffect } from "react";
import { apiPost } from "../../utils/api";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Box,
  TextareaAutosize,
  CircularProgress,
  Paper,
  Collapse,
  Alert,
  IconButton,
  FormLabel,
} from "@mui/material";
import "./CreateLink.css";
import CloseIcon from "@mui/icons-material/Close";
import { encrypt } from "../../utils/crypto";

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
      component={Paper}
      sx={{
        maxWidth: "650px",
        margin: "auto",
        padding: 3,
      }}
    >
      <form
        onSubmit={(e: any) => {
          e.preventDefault();
          if (linkType === "Open Track link") {
            handleOpenTrackLinkCreation();
          } else {
            handleAddOffer();
          }
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
          Create Offer Link
        </Typography>
        <Collapse in={alert.open} sx={{ mt: 2 }}>
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
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        </Collapse>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormLabel>Link Type</FormLabel>
              <Select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="Subscribe link">Subscribe</MenuItem>
                <MenuItem value="Unsubscribe link">Unsubscribe</MenuItem>
                <MenuItem value="Open Track link">Open Track</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Domain</FormLabel>
              <TextField
                required
                size="small"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://healthcare.info"
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Campaign ID</FormLabel>
              <TextField
                required
                size="small"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Affiliate Campaign ID"
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Offer ID</FormLabel>
              <TextField
                required
                size="small"
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
                placeholder="Enter Offer ID"
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Link Pattern</FormLabel>
              <TextField
                required
                size="small"
                value={linkPattern}
                onChange={(e) => setLinkPattern(e.target.value)}
                placeholder="/abc123/xyz456"
                fullWidth
                disabled={linkType === "Open Track link"}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Redirect Link</FormLabel>
              <TextField
                required
                size="small"
                value={redirectLink}
                onChange={(e) => setRedirectLink(e.target.value)}
                placeholder="https://www.exampleform.com/sdvdf?sub1=offerid"
                fullWidth
                multiline
                disabled={linkType === "Open Track link"}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            // onClick={handleAddOffer}
            disabled={loading}
            type="submit"
            sx={{ width: "50%", padding: 1 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Link"
            )}
          </Button>
        </Box>
      </form>
      {generatedLink && (
        <Box
          mt={3}
          sx={{
            backgroundColor: "#fff",
            padding: 2,
            borderRadius: 1,
          }}
        >
          <Box component="span" sx={{ display: "flex" }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Generated Link
            </Typography>
            {copied && (
              <Typography
                variant="subtitle1"
                color="success.main"
                sx={{ ml: 1 }}
              >
                Copied!
              </Typography>
            )}
          </Box>
          <TextareaAutosize
            minRows={3}
            value={generatedLink}
            readOnly
            style={{
              width: "100%",
              padding: 8,
              fontFamily: "monospace",
              backgroundColor: "#f5f5f5",
            }}
          />
          <Box mt={1}>
            <Button
              variant="outlined"
              color="success"
              onClick={handleCopyToClipboard}
              fullWidth
              sx={{ width: "40%" }}
            >
              Copy Link
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CreateLink;
