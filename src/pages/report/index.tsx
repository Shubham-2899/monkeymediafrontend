import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

interface ReportData {
  offerId: string;
  date: string;
  offerName: string;
  totalClicks: number;
  affiliate: string;
  revenue: number;
  expired: boolean;
  emailSentCount: number;
}

const Report: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = sessionStorage.getItem("Auth Token");

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/url/reports`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReportData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching report data");
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

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
    <Box sx={{ mt: "20px" }}>
      <Typography
        variant="h4"
        gutterBottom
        // color="primary"
        sx={{ textAlign: "center" }}
      >
        Report
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "lightgray" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Affiliate</TableCell>
              <TableCell>Offer ID</TableCell>
              <TableCell>Offer Name</TableCell>
              <TableCell>Email Sent</TableCell>
              <TableCell>Total Clicks</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Expired</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((data, index) => (
              <TableRow
                key={index}
                sx={{ bgcolor: index % 2 != 0 ? "lightblue" : "" }}
              >
                <TableCell>{data?.date || "NA"}</TableCell>
                <TableCell>{data?.affiliate || "NA"}</TableCell>
                <TableCell>{data.offerId}</TableCell>
                <TableCell>{data?.offerName || "TEST"}</TableCell>
                <TableCell>{data?.emailSentCount || 0}</TableCell>
                <TableCell>{data.totalClicks}</TableCell>
                <TableCell>{data.revenue || "$" + 0}</TableCell>
                <TableCell>{data.expired ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Report;
