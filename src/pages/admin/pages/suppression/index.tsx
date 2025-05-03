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
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
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
    { field: "email", headerName: "Email", flex: 1, maxWidth: 300 },
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
    },
    { field: "domain", headerName: "Domain", flex: 1, maxWidth: 250 },
  ];

  return (
    <Box>
      <Box sx={{ mt: "20px", width: "100%" }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Suppression List
        </Typography>

        <Box
          component={"form"}
          onSubmit={(e) => {
            e.preventDefault();
            console.log("🚀 ~ filterDates:", filterDates);
            setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
          }}
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
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

        {suppressionData.length === 0 && loading ? (
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
            slots={{
              noRowsOverlay: () => (
                <Typography sx={{ mt: 2 }} align="center">
                  No suppression records found.
                </Typography>
              ),
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Suppression;
