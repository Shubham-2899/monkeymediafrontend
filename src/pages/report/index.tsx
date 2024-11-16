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
  const [searchParams, setSearchParams] = useState({
    offerId: "",
    campaignId: "",
  });
  const [alert, setAlert] = useState({
    open: false,
    severity: "success" as "success" | "error",
    message: "",
  });

  const fetchReportData = async (
    currentPage: number,
    currentPageSize: number
  ) => {
    setLoading(true);
    try {
      const params = {
        ...searchParams,
        page: currentPage + 1,
        pageSize: currentPageSize,
      };
      const response = await apiGet(`/reports`, params);
      setReportData(response.data.reports);
      setTotalElements(response.data.totalElements);
      setLoading(false);
    } catch (error) {
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to fetch report data. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const offerId = formData.get("offerId") as string;
    const campaignId = formData.get("campaignId") as string;
    if (!offerId && !campaignId) {
      return;
    }
    setSearchParams({ offerId, campaignId });
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handleReset = () => {
    setSearchParams({ offerId: "", campaignId: "" });
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueGetter: (params) => new Date(params).toLocaleString(),
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
            value={searchParams.offerId}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, offerId: e.target.value }))
            }
          />
          <TextField
            label="Campaign ID"
            name="campaignId"
            size="small"
            value={searchParams.campaignId}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                campaignId: e.target.value,
              }))
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
            rows={reportData.map((report, index) => ({
              id: index + paginationModel.page * paginationModel.pageSize,
              ...report,
            }))}
            columns={columns}
            disableColumnFilter
            disableColumnMenu
            loading={loading || reportData.length === 0}
            rowCount={totalElements}
            pagination
            pageSizeOptions={[20, 50, 100]}
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
