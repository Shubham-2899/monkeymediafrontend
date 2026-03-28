import React, { useEffect, useState, useCallback } from "react";
import {
  Alert, Box, Typography, TextField, Button, Collapse,
  IconButton, CircularProgress, Stack, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { apiGet } from "../../utils/api";
import { IReport } from "../../utils/interface";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentIcon from "@mui/icons-material/Assessment";
import RefreshIcon from "@mui/icons-material/Refresh";

// ─── Tab panel ────────────────────────────────────────────────────────────────

const TabPanel: React.FC<{ value: number; index: number; children: React.ReactNode }> = ({ value, index, children }) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>{value === index && children}</Box>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const PROVIDERS = ["All", "Gmail", "Yahoo", "AOL", "Comcast", "Hotmail"];

// ─── Daily Sending Report Tab ─────────────────────────────────────────────────

interface DailyRow {
  id: string;
  domain: string;
  ip: string;
  sent: number;
  failed: number;
  total: number;
}

interface DailyTotals { sent: number; failed: number; total: number; }

const DailySendingTab: React.FC = () => {
  const [date, setDate] = useState(today());
  const [provider, setProvider] = useState("All");
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ sent: 0, failed: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = { date };
      if (provider !== "All") params.provider = provider.toLowerCase();
      const res = await apiGet("/reports/sending/daily", params);
      const data = res.data;
      setRows(data.rows.map((r: DailyRow, i: number) => ({ ...r, id: `${r.domain}-${r.ip}-${i}` })));
      setTotals(data.totals);
    } catch {
      setError("Failed to load daily sending report.");
    } finally {
      setLoading(false);
    }
  }, [date, provider]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Box>
      {/* Controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mb={2}
        sx={{ p: 2, background: "#f8f9fa", borderRadius: 2 }}>
        <TextField label="Date" type="date" size="small" value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {PROVIDERS.map((p) => (
            <Chip key={p} label={p} size="small" clickable
              color={provider === p ? "primary" : "default"}
              variant={provider === p ? "filled" : "outlined"}
              onClick={() => setProvider(p)}
              sx={{ fontWeight: 600 }} />
          ))}
        </Stack>
        <Button size="small" startIcon={<RefreshIcon />} onClick={fetch} disabled={loading}
          sx={{ textTransform: "none", ml: "auto" }}>
          Refresh
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#1976d2" }}>
                {["Domain", "IP", "Sent (Relay)", "Failed", "Total"].map((h) => (
                  <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No data for {date}.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((row) => (
                    <TableRow key={row.id} sx={{ "&:hover": { background: "#f5f8ff" } }}>
                      <TableCell><Typography variant="body2" color="text.secondary">{row.domain}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={500}>{row.ip}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="success.main" fontWeight={600}>{row.sent.toLocaleString()}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color={row.failed > 0 ? "error.main" : "text.secondary"} fontWeight={600}>{row.failed.toLocaleString()}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{row.total.toLocaleString()}</Typography></TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow sx={{ background: "#e3f2fd" }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: 13 }}>TOTAL</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "success.main" }}>{totals.sent.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: totals.failed > 0 ? "error.main" : "text.secondary" }}>{totals.failed.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{totals.total.toLocaleString()}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        * Sent = accepted by SMTP (250 OK). Failed = rejected by SMTP (5xx/error).
        Deferred tracking requires MTA accounting log integration (see docs/mta-accounting-log-plan.md).
      </Typography>
    </Box>
  );
};

// ─── Hourly Report Tab ────────────────────────────────────────────────────────

interface HourlyRow {
  id: string;
  domain: string;
  ip: string;
  total: number;
  [key: string]: string | number; // H0–H23
}

const HourlySendingTab: React.FC = () => {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<HourlyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/reports/sending/hourly", { date });
      setRows(res.data.rows.map((r: HourlyRow, i: number) => ({ ...r, id: `${r.domain}-${r.ip}-${i}` })));
    } catch {
      setError("Failed to load hourly report.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  // Build columns: Server | IP | H0–H23 | Total
  const hourColumns: GridColDef[] = [
    { field: "domain", headerName: "Server", width: 160, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value}</Typography> },
    { field: "ip", headerName: "IP", width: 140, renderCell: (p) => <Typography variant="body2" fontFamily="monospace">{p.value}</Typography> },
    ...Array.from({ length: 24 }, (_, h) => ({
      field: `H${h}`,
      headerName: `H${h}`,
      width: 52,
      type: "number" as const,
      renderCell: (p: { value?: number }) => (
        <Typography variant="caption" color={(p.value ?? 0) > 0 ? "primary" : "text.disabled"} fontWeight={(p.value ?? 0) > 0 ? 700 : 400}>
          {p.value ?? 0}
        </Typography>
      ),
    })),
    { field: "total", headerName: "Total", width: 80, type: "number", renderCell: (p) => <Typography variant="body2" fontWeight={700}>{p.value}</Typography> },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}
        sx={{ p: 2, background: "#f8f9fa", borderRadius: 2 }}>
        <TextField label="Date" type="date" size="small" value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
        <Button size="small" startIcon={<RefreshIcon />} onClick={fetch} disabled={loading}
          sx={{ textTransform: "none", ml: "auto" }}>
          Refresh
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={hourColumns}
          autoHeight
          disableColumnFilter
          disableColumnMenu
          pageSizeOptions={[25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            border: "1px solid #e0e0e0", borderRadius: 2,
            "& .MuiDataGrid-columnHeaders": { background: "#1976d2" },
            "& .MuiDataGrid-columnHeader": { background: "#1976d2" },
            "& .MuiDataGrid-columnHeaderTitle": { color: "#fff", fontWeight: 700, fontSize: 12 },
            "& .MuiDataGrid-columnSeparator": { color: "rgba(255,255,255,0.3)" },
            "& .MuiDataGrid-sortIcon": { color: "#fff" },
            "& .MuiDataGrid-menuIconButton": { color: "#fff" },
            "& .MuiDataGrid-row:hover": { background: "#f5f8ff" },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #f0f0f0" },
          }}
        />
      )}
    </Box>
  );
};

// ─── Click Reports Tab (existing — unchanged) ─────────────────────────────────

const ClickReportsTab: React.FC = () => {
  const [reportData, setReportData] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalElements, setTotalElements] = useState(0);
  const [alert, setAlert] = useState({ open: false, severity: "success" as "success" | "error", message: "" });
  const [filters, setFilters] = useState({ offerId: "", campaignId: "", fromDate: "", toDate: "" });
  const [appliedFilters, setAppliedFilters] = useState({ offerId: "", campaignId: "", fromDate: "", toDate: "" });

  const fetchReportData = useCallback(async (currentPage: number, currentPageSize: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { ...appliedFilters, page: currentPage + 1, pageSize: currentPageSize };
      const response = await apiGet("/reports", params);
      setReportData(response.data.reports);
      setTotalElements(response.data.totalElements);
    } catch {
      setAlert({ open: true, severity: "error", message: "Failed to fetch report data. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchReportData(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel, fetchReportData]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleReset = () => {
    const reset = { offerId: "", campaignId: "", fromDate: "", toDate: "" };
    setFilters(reset);
    setAppliedFilters(reset);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const columns: GridColDef[] = [
    {
      field: "date", headerName: "Date", flex: 1,
      valueGetter: (value) => value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
    },
    { field: "offerId", headerName: "Offer ID", flex: 1, maxWidth: 250 },
    { field: "campaignId", headerName: "Campaign ID", flex: 1, maxWidth: 250 },
    { field: "clickCount", headerName: "Click Count", flex: 1, maxWidth: 250 },
    { field: "totalEmailSent", headerName: "Total Emails Sent", flex: 1, maxWidth: 250 },
    {
      field: "openRate", headerName: "Open Rate (%)", flex: 1, maxWidth: 250,
      valueGetter: (value, row) => {
        const openRate = Number(value || 0);
        const totalEmailSent = Number(row?.totalEmailSent || 0);
        return totalEmailSent > 0 ? ((openRate / totalEmailSent) * 100).toFixed(2) : "0.00";
      },
    },
  ];

  const totalClickCount = reportData.reduce((sum, item) => sum + (item.clickCount || 0), 0);
  const totalEmailSent = reportData.reduce((sum, item) => sum + (item.totalEmailSent || 0), 0);

  const rowsWithTotal = [
    ...reportData.map((report, index) => ({ id: index + paginationModel.page * paginationModel.pageSize, ...report })),
    { id: "totals-row", date: "", offerId: "", campaignId: "TOTAL", clickCount: totalClickCount, totalEmailSent, openRate: "", isSummary: true },
  ];

  return (
    <Box>
      <Box component="form" onSubmit={handleSearch}
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2, p: 2, background: "#f8f9fa", borderRadius: 2 }}>
        <TextField label="Offer ID" name="offerId" size="small" value={filters.offerId}
          onChange={(e) => setFilters((p) => ({ ...p, offerId: e.target.value }))} sx={{ minWidth: 120 }} />
        <TextField label="Campaign ID" name="campaignId" size="small" value={filters.campaignId}
          onChange={(e) => setFilters((p) => ({ ...p, campaignId: e.target.value }))} sx={{ minWidth: 120 }} />
        <TextField label="From Date" type="date" size="small" name="fromDate" InputLabelProps={{ shrink: true }}
          value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} sx={{ minWidth: 140 }} />
        <TextField label="To Date" type="date" size="small" name="toDate" InputLabelProps={{ shrink: true }}
          value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} sx={{ minWidth: 140 }} />
        <Button variant="contained" type="submit" sx={{ borderRadius: 2, textTransform: "none", minWidth: 90 }}>Search</Button>
        <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: 2, textTransform: "none", minWidth: 90 }}>Reset</Button>
      </Box>

      <Collapse in={alert.open} sx={{ mb: 2 }}>
        <Alert severity={alert.severity}
          action={<IconButton size="small" onClick={() => setAlert((p) => ({ ...p, open: false }))}><CloseIcon fontSize="inherit" /></IconButton>}>
          {alert.message}
        </Alert>
      </Collapse>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", height: 200, alignItems: "center" }}><CircularProgress /></Box>
      ) : reportData.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>No reports found for the selected filters.</Typography>
      ) : (
        <DataGrid
          rows={rowsWithTotal}
          getRowClassName={(params) => params.row.isSummary ? "summary-row" : ""}
          columns={columns}
          disableColumnFilter disableColumnMenu
          loading={loading}
          rowCount={totalElements}
          pagination pageSizeOptions={[10, 25, 50, 100]}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(m) => setPaginationModel(m)}
          sx={{
            background: "#fff", borderRadius: 2, border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #f0f0f0" },
            "& .MuiDataGrid-columnHeaders": { background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" },
            "& .MuiDataGrid-row:hover": { background: "#f8f9fa" },
          }}
        />
      )}
    </Box>
  );
};

// ─── Main Report Page ─────────────────────────────────────────────────────────

const Report: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" pb={2} mb={2}
        sx={{ borderBottom: "1px solid #e0e0e0" }}>
        <AssessmentIcon sx={{ fontSize: 32, color: "#1976d2" }} />
        <Box>
          <Typography variant="h5" fontWeight={600} color="#333">Reports</Typography>
          <Typography variant="body2" color="#666">Campaign performance, sending stats and click tracking</Typography>
        </Box>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e0e0e0", mb: 2 }}>
        <Tab label="Click Reports" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab label="Daily Sending" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab label="Hourly Breakdown" sx={{ textTransform: "none", fontWeight: 600 }} />
      </Tabs>

      <TabPanel value={tab} index={0}><ClickReportsTab /></TabPanel>
      <TabPanel value={tab} index={1}><DailySendingTab /></TabPanel>
      <TabPanel value={tab} index={2}><HourlySendingTab /></TabPanel>
    </Box>
  );
};

export default Report;
