import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, Stack, Chip, IconButton, Tooltip,
  CircularProgress, Snackbar, Alert, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TablePagination,
} from "@mui/material";
import BounceIcon from "@mui/icons-material/MarkEmailUnread";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncIcon from "@mui/icons-material/Sync";
import CloseIcon from "@mui/icons-material/Close";
import { apiGet, apiPost, apiDelete } from "../../../../utils/api";

interface BouncedEmail {
  _id: string;
  email: string;
  domain: string;
  bounceType: "hard" | "soft";
  statusCode?: string;
  diagnosticMessage?: string;
  bouncedAt: string;
}

interface PollResult {
  success: boolean;
  processed?: number;
  errors?: number;
  message?: string;
}

const Bounces: React.FC = () => {
  const [bounces, setBounces] = useState<BouncedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterDomain, setFilterDomain] = useState("");
  const [filterType, setFilterType] = useState<"" | "hard" | "soft">("");
  const [polling, setPolling] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>
    ({ open: false, message: "", severity: "success" });

  const showSnackbar = (message: string, severity: "success" | "error" | "info") =>
    setSnackbar({ open: true, message, severity });

  const fetchBounces = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(pageSize) };
      if (filterDomain) params.domain = filterDomain;
      if (filterType) params.type = filterType;

      const res = await apiGet("/bounces", params);
      setBounces(res.data.data);
      setTotal(res.data.total);
    } catch {
      showSnackbar("Failed to load bounce data.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterDomain, filterType]);

  useEffect(() => { fetchBounces(); }, [fetchBounces]);

  const handlePollAll = async () => {
    setPolling(true);
    try {
      const res = await apiPost("/bounces/poll", {});
      const result: PollResult = res.data;
      showSnackbar(result.message || "Bounce poll triggered for all domains.", "info");
      setTimeout(fetchBounces, 2000); // refresh after a short delay
    } catch {
      showSnackbar("Failed to trigger bounce poll.", "error");
    } finally {
      setPolling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/bounces/${encodeURIComponent(deleteTarget)}`);
      showSnackbar("Email removed from bounce list.", "success");
      setDeleteTarget(null);
      fetchBounces();
    } catch {
      showSnackbar("Failed to remove email.", "error");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ background: "#fce4ec", borderRadius: 2, p: 1, display: "flex" }}>
            <BounceIcon sx={{ color: "#c62828", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>Bounce List</Typography>
            <Typography variant="body2" color="text.secondary">
              {total} bounced email{total !== 1 ? "s" : ""} recorded
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={polling ? <CircularProgress size={14} /> : <SyncIcon />}
            onClick={handlePollAll}
            disabled={polling}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {polling ? "Polling…" : "Poll All Domains"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBounces}
            disabled={loading}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Stats cards */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        {[
          { label: "Hard Bounces", value: bounces.filter(b => b.bounceType === "hard").length, color: "#c62828", bg: "#ffebee" },
          { label: "Soft Bounces", value: bounces.filter(b => b.bounceType === "soft").length, color: "#e65100", bg: "#fff3e0" },
          { label: "Total (this page)", value: bounces.length, color: "#1565c0", bg: "#e3f2fd" },
        ].map((stat) => (
          <Card key={stat.label} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems="center">
        <TextField
          label="Filter by domain"
          size="small"
          value={filterDomain}
          onChange={(e) => { setFilterDomain(e.target.value); setPage(1); }}
          placeholder="e.g. rapidnest.org"
          sx={{ minWidth: 220 }}
        />
        <TextField
          label="Bounce type"
          select
          size="small"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as "" | "hard" | "soft"); setPage(1); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All types</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
          <MenuItem value="soft">Soft</MenuItem>
        </TextField>
        <Button
          variant="text"
          size="small"
          onClick={() => { setFilterDomain(""); setFilterType(""); setPage(1); }}
          sx={{ textTransform: "none" }}
        >
          Clear filters
        </Button>
      </Stack>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Domain</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Status Code</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Diagnostic</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Bounced At</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bounces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <BounceIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">No bounce records found.</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<SyncIcon />}
                      onClick={handlePollAll}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Poll mailboxes now
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                bounces.map((bounce) => (
                  <TableRow
                    key={bounce._id}
                    sx={{ "&:hover": { background: "#fafafa" }, "& td": { borderBottom: "1px solid #f0f0f0" } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                        {bounce.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{bounce.domain}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bounce.bounceType === "hard" ? "Hard" : "Soft"}
                        size="small"
                        color={bounce.bounceType === "hard" ? "error" : "warning"}
                        variant={bounce.bounceType === "hard" ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                        {bounce.statusCode || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Tooltip title={bounce.diagnosticMessage || ""} placement="top">
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {bounce.diagnosticMessage || "—"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(bounce.bouncedAt).toLocaleDateString(undefined, {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove from bounce list">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(bounce.email)}
                          sx={{ color: "#e53935", "&:hover": { background: "#ffebee" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </TableContainer>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Remove from Bounce List</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Remove <strong style={{ fontFamily: "monospace" }}>{deleteTarget}</strong> from the bounce list?
            This is an admin correction — the email will no longer be flagged as bounced.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ textTransform: "none" }}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          action={
            <IconButton size="small" onClick={() => setSnackbar((p) => ({ ...p, open: false }))}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Bounces;
