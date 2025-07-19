import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Collapse,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { apiGet } from "../../../../utils/api";

interface ISuppression {
  email: string;
  date: string; // format: YYYY-MM-DD
  domain: string;
}

const Suppression: React.FC = () => {
  const [suppressionData, setSuppressionData] = useState<ISuppression[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);
  const [filterDates, setFilterDates] = useState<{
    fromDate: string;
    toDate: string;
  }>({
    fromDate: "",
    toDate: "",
  });
  const [alert, setAlert] = useState({
    open: false,
    severity: "success" as "success" | "error",
    message: "",
  });

  const fetchSuppressionData = async () => {
    setLoading(true);
    try {
      const { page, pageSize } = paginationModel;
      const response = await apiGet(
        `/email_list/suppressions?page=${page + 1}&limit=${pageSize}&fromDate=${
          filterDates.fromDate
        }&toDate=${filterDates.toDate}`
      );
      console.log("🚀 ~ fetchSuppressionData ~ response.data:", response.data);
      setSuppressionData(response.data.data);
      setTotalElements(response.data.pagination.total);
      setLoading(false);
    } catch (error) {
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to fetch suppression data. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppressionData();
  }, [paginationModel]);

  const handleReset = () => {
    setFilterDates({ fromDate: "", toDate: "" });
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const columns: GridColDef[] = [
    { 
      field: "email", 
      headerName: "Email", 
      flex: 1, 
      maxWidth: 300,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      maxWidth: 200,
      valueGetter: (value) => {
        if (!value) return "N/A";
        const dateObj = new Date(value);
        return dateObj.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="default"
        />
      ),
    },
    { 
      field: "domain", 
      headerName: "Domain", 
      flex: 1, 
      maxWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto" }}>
      <Card elevation={1} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e0e0e0" }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            background: "#ffffff",
            color: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0e0e0"
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <BlockIcon sx={{ fontSize: 32, color: "#d32f2f" }} />
              <Box>
                <Typography variant="h5" fontWeight={600} color="#333">
                  Suppression List
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {totalElements} suppressed emails
                </Typography>
              </Box>
            </Stack>

            {/* Filters moved to header */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                console.log("🚀 ~ filterDates:", filterDates);
                setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
              }}
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="From Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filterDates.fromDate}
                onChange={(e) =>
                  setFilterDates((prev) => ({
                    ...prev,
                    fromDate: e.target.value,
                  }))
                }
                sx={{ minWidth: 150, background: "white", borderRadius: 1 }}
              />
              <TextField
                label="To Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filterDates.toDate}
                onChange={(e) =>
                  setFilterDates((prev) => ({
                    ...prev,
                    toDate: e.target.value,
                  }))
                }
                sx={{ minWidth: 150, background: "white", borderRadius: 1 }}
              />
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" 
                  type="submit"
                  startIcon={<SearchIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                  size="small"
                >
                  Search
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                  size="small"
                >
                  Reset
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, pt:0 }}>
            <Collapse in={alert.open} sx={{ mb: 2 }}>
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

            {suppressionData.length === 0 && loading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 400,
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <CircularProgress size={40} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Loading suppression data...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={suppressionData.map((item, index) => ({
                    id: index + paginationModel.page * paginationModel.pageSize,
                    ...item,
                  }))}
                  columns={columns}
                  disableColumnFilter
                  disableColumnMenu
                  loading={loading || suppressionData.length === 0}
                  rowCount={totalElements}
                  pagination
                  pageSizeOptions={[10, 25, 50, 100]}
                  paginationMode="server"
                  paginationModel={paginationModel}
                  onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                  sx={{
                    border: "none",
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
                  slots={{
                    noRowsOverlay: () => (
                      <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        height: "100%",
                        gap: 2
                      }}>
                        <BlockIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                        <Typography variant="h6" color="text.secondary">
                          No suppression records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your filters or check back later
                        </Typography>
                      </Box>
                    ),
                  }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Suppression;
