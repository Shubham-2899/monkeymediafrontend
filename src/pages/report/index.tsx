import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Typography,
  TextField,
  Button,
  Collapse,
  IconButton,
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
      //API Mocking
      // let filters = searchParams;
      // setTimeout(() => {
      //   let response = {
      //     message: "Reports fetched successfully.",
      //     success: true,
      //     reports: [
      //       {
      //         offerId: "test 11",
      //         campaignId: "test 11",
      //         clickCount: 6,
      //         totalEmailSent: 0,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "Ajay01",
      //         campaignId: "20844502",
      //         clickCount: 1,
      //         totalEmailSent: 0,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "ajay123",
      //         campaignId: "20844502",
      //         clickCount: 175,
      //         totalEmailSent: 0,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "12344",
      //         campaignId: "ajay11",
      //         clickCount: 2,
      //         totalEmailSent: 0,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "rahul12",
      //         campaignId: "20844502",
      //         clickCount: 3,
      //         totalEmailSent: 0,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "Ajay30MyGov",
      //         campaignId: "20844502",
      //         clickCount: 9,
      //         totalEmailSent: 113,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "Ajay31",
      //         campaignId: "20844502 ",
      //         clickCount: 2,
      //         totalEmailSent: 0,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "rahul4nov",
      //         campaignId: "20844502",
      //         clickCount: 0,
      //         totalEmailSent: 76,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "rahul4nov",
      //         campaignId: "20844502",
      //         clickCount: 0,
      //         totalEmailSent: 76,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //       {
      //         offerId: "rahul4nov",
      //         campaignId: "20844502",
      //         clickCount: 5,
      //         totalEmailSent: 76,
      //         date: "2024-11-16T03:28:46.638Z",
      //       },
      //     ].filter(
      //       (report) =>
      //         (!filters.offerId || report.offerId.includes(filters.offerId)) &&
      //         (!filters.campaignId ||
      //           report.campaignId.includes(filters.campaignId))
      //     ),
      //     page: "1",
      //     pageSize: "10",
      //     totalElements: 33,
      //   };
      //   setReportData(response.reports);
      //   setTotalElements(response.totalElements);
      //   setLoading(false);
      // }, 2000);
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
            // flexDirection: { xs: "column" },
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
          <Button variant="outlined" type="submit">
            Search
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
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
        <DataGrid
          rows={reportData.map((report, index) => ({
            id: index + paginationModel.page * paginationModel.pageSize,
            ...report,
          }))}
          columns={columns}
          disableColumnFilter
          disableColumnMenu
          loading={loading}
          rowCount={totalElements}
          pagination
          pageSizeOptions={[20, 50, 100]}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
        />
      </Box>
    </Box>
  );
};

export default Report;
