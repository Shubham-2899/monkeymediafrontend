import React, { useEffect, useState } from "react";
import {
  Container,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { apiGet } from "../../utils/api";

interface IReport {
  offerId: string;
  campaignId: string;
  clickCount: number;
  totalEmailSent: number;
  date: string;
}

const Report: React.FC = () => {
  const [reportData, setReportData] = useState<IReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchReportData = async (
    currentPage: number,
    currentPageSize: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(
        `/reports?page=${currentPage + 1}&pageSize=${currentPageSize}`
      );
      setReportData(response.data.reports);
      setTotalElements(response.data.totalElements);
      setLoading(false);
    } catch (error) {
      setError("Error fetching report data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel]);

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

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ mt: "20px", width: "100%" }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 2 }}>
        Report
      </Typography>
      <DataGrid
        rows={reportData.map((report, index) => ({
          id: index + paginationModel.page * paginationModel.pageSize,
          ...report,
        }))}
        columns={columns}
        disableColumnFilter
        disableColumnMenu
        rowCount={totalElements}
        pagination
        pageSizeOptions={[20, 50, 100]}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
      />
    </Box>
  );
};

export default Report;
