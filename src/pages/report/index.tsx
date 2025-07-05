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
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { apiGet } from "../../utils/api";
import { IReport } from "../../utils/interface";
import CloseIcon from "@mui/icons-material/Close";

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
      const params: any = {
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
      valueGetter: (value, _row) =>
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
    <Box>
      <Box sx={{ mt: "20px", width: "100%" }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Report
        </Typography>
        <Box
          component={"form"}
          onSubmit={handleSearch}
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
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
          />
          <TextField
            label="Campaign ID"
            name="campaignId"
            size="small"
            value={filters.campaignId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, campaignId: e.target.value }))
            }
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: "row",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
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
            />
            <Button variant="outlined" type="submit">
              Search
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Box>
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
        {reportData.length === 0 && loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
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
          />
        )}
      </Box>
    </Box>
  );
};

export default Report;
