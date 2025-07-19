import { Box, Button, CircularProgress, Typography, Card, CardContent, Snackbar, Alert, Stack, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../utils/api";
import ReusableModal from "../../../../components/ReusableModal";
import ServerDataTable from "./ServerDataTable";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedServerData, setSelectedServerData] = useState([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(false);
      try {
        const { page, pageSize } = paginationModel;
        const response = await apiGet(`/users?page=${page}&size=${pageSize}`);
        setUsers(response.data.users);
        setTotalElements(response.data?.users?.length);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(true);
        setSnackbar({ open: true, message: "Failed to load users. Please try again later.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [paginationModel]);

  const handleOpenModal = (serverData: any) => {
    setSelectedServerData(serverData);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedServerData([]);
  };

  const columns = [
    { 
      field: "name", 
      headerName: "Name", 
      flex: 1,
      renderCell: (params: any) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      ),
    },
    { 
      field: "email", 
      headerName: "Email", 
      flex: 1.5,
      renderCell: (params: any) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "isAdmin",
      headerName: "Role",
      flex: 0.8,
      renderCell: (params: any) => (
        <Chip
          label={params.value ? "Admin" : "User"}
          color={params.value ? "primary" : "default"}
          size="small"
          variant={params.value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "serverData",
      headerName: "Server Data",
      flex: 1.2,
      renderCell: (params: any) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenModal(params.value)}
          size="small"
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          View Details
        </Button>
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
              <PeopleIcon sx={{ fontSize: 32, color: "#1976d2" }} />
              <Box>
                <Typography variant="h5" fontWeight={600} color="#333">
                  Users Management
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {totalElements} total users
                </Typography>
              </Box>
            </Stack>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2, 
                textTransform: "none",
                boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(25, 118, 210, 0.3)",
                }
              }}
            >
              Add User
            </Button>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {loading ? (
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
                  Loading users...
                </Typography>
              </Box>
            ) : error ? (
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
                <Typography variant="h6" color="error">
                  Failed to load users
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Please try again later
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={users}
                  columns={columns}
                  getRowId={(row: any) => row._id}
                  rowCount={totalElements}
                  disableRowSelectionOnClick
                  disableColumnSelector
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
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Modal for server details */}
      <ReusableModal
        open={openModal}
        handleClose={handleCloseModal}
        title="Server Details"
        actions={
          <Button variant="outlined" color="primary" onClick={handleCloseModal}>
            Close
          </Button>
        }
      >
        <Box>
          {selectedServerData.length > 0 ? (
            <ServerDataTable serverData={selectedServerData} />
          ) : (
            <Typography>No server details available.</Typography>
          )}
        </Box>
      </ReusableModal>

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
