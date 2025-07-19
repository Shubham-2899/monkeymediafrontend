import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Typography,
  TextField,
  Button,
  Collapse,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { apiGet } from "../../utils/api";
import { IReport } from "../../utils/interface";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentIcon from "@mui/icons-material/Assessment";

const Report: React.FC = () => {
  const [reportData, setReportData] = useState<IReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);

  const [alert, setAlert] = useState({
    open: false,
    severity: "success" as "success" | "error",
    message: "",
  });

  const [filters, setFilters] = useState({
    offerId: "",
    campaignId: "",
    fromDate: "",
    toDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    offerId: "",
    campaignId: "",
    fromDate: "",
    toDate: "",
  });

  const fetchReportData = async (
    currentPage: number,
    currentPageSize: number
  ) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        ...appliedFilters,
        page: currentPage + 1,
        pageSize: currentPageSize,
      };

      const response = await apiGet(`/reports`, params);
      setReportData(response.data.reports);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to fetch report data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel, appliedFilters]);

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
      field: "date",
      headerName: "Date",
      flex: 1,
      valueGetter: (value) =>
        value
          ? new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
    },
    { field: "offerId", headerName: "Offer ID", flex: 1, maxWidth: 250 },
    { field: "campaignId", headerName: "Campaign ID", flex: 1, maxWidth: 250 },
    { field: "clickCount", headerName: "Click Count", flex: 1, maxWidth: 250 },
    {
      field: "totalEmailSent",
      headerName: "Total Emails Sent",
      flex: 1,
      maxWidth: 250,
    },
    {
      field: "openRate",
      headerName: "Open Rate (%)",
      flex: 1,
      maxWidth: 250,
      valueGetter: (value, row) => {
        const openRate = Number(value || 0);
        const totalEmailSent = Number(row?.totalEmailSent || 0);
        return totalEmailSent > 0
          ? ((openRate / totalEmailSent) * 100).toFixed(2)
          : "0.00";
      },
    },
  ];

  const totalClickCount = reportData.reduce(
    (sum, item) => sum + (item.clickCount || 0),
    0
  );
  const totalEmailSent = reportData.reduce(
    (sum, item) => sum + (item.totalEmailSent || 0),
    0
  );

  const rowsWithTotal = [
    ...reportData.map((report, index) => ({
      id: index + paginationModel.page * paginationModel.pageSize,
      ...report,
    })),
    {
      id: "totals-row",
      date: "",
      offerId: "",
      campaignId: "TOTAL",
      clickCount: totalClickCount,
      totalEmailSent: totalEmailSent,
      openRate: "", // Optional
      isSummary: true, // For custom styling
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          // p: 3,
          pb: 3,
          background: "#fff",
          color: "#333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e0e0e0",
          width: "100%",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <AssessmentIcon sx={{ fontSize: 32, color: "#1976d2" }} />
          <Box>
            <Typography variant="h5" fontWeight={600} color="#333">
              Report
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              View and filter campaign performance reports
            </Typography>
          </Box>
        </Stack>
        <Box
          component={"form"}
          onSubmit={handleSearch}
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            background: { xs: "none", sm: "#f8f9fa" },
            p: { xs: 0, sm: 2 },
            borderRadius: 2,
          }}
        >
          <TextField
            label="Offer ID"
            name="offerId"
            size="small"
            value={filters.offerId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, offerId: e.target.value }))
            }
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="Campaign ID"
            name="campaignId"
            size="small"
            value={filters.campaignId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, campaignId: e.target.value }))
            }
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="From Date"
            type="date"
            size="small"
            name="fromDate"
            InputLabelProps={{ shrink: true }}
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                fromDate: e.target.value,
              }))
            }
            sx={{ minWidth: 140 }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            name="toDate"
            InputLabelProps={{ shrink: true }}
            value={filters.toDate}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                toDate: e.target.value,
              }))
            }
            sx={{ minWidth: 140 }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{ borderRadius: 2, textTransform: "none", minWidth: 90 }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ borderRadius: 2, textTransform: "none", minWidth: 90 }}
          >
            Reset
          </Button>
        </Box>
      </Box>
      <Collapse in={alert.open} sx={{ mt: 2, mx: 3 }}>
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
      <Box>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : reportData.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              padding: "20px",
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">
              No reports found for the selected filters.
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={rowsWithTotal}
            getRowClassName={(params) =>
              params.row.isSummary ? "summary-row" : ""
            }
            columns={columns}
            disableColumnFilter
            disableColumnMenu
            loading={loading || reportData.length === 0}
            rowCount={totalElements}
            pagination
            pageSizeOptions={[10, 25, 50, 100]}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
            sx={{
              background: "#fff",
              borderRadius: 2,
              mt: 2,
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f0f0f0",
              },
              "& .MuiDataGrid-columnHeaders": {
                background: "#f8f9fa",
                borderBottom: "2px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:hover": {
                background: "#f8f9fa",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Report;
