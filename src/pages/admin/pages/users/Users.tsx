import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../utils/api";
import ReusableModal from "../../../../components/ReusableModal";

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
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenModal = (serverData: any) => {
    setSelectedServerData(serverData);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedServerData([]);
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "isAdmin",
      headerName: "Admin",
      flex: 0.5,
      renderCell: (params: any) => (params.value ? "Yes" : "No"),
    },
    {
      field: "serverData",
      headerName: "Server Data",
      flex: 2,
      renderCell: (params: any) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenModal(params.value)}
          size="small"
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Users</Typography>
        <Button variant="outlined" color="primary">
          Add User
        </Button>
      </Box>
      {loading ? (
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
      ) : error ? (
        <Typography color="error" align="center">
          Failed to load users. Please try again later.
        </Typography>
      ) : (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row: any) => row._id}
            rowCount={totalElements}
            disableRowSelectionOnClick
            // paginations
            pageSizeOptions={[10, 25, 50, 100]}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          />
        </Box>
      )}

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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2}>Host</TableCell>
                    <TableCell rowSpan={2}>Provider</TableCell>
                    <TableCell rowSpan={2}>Status</TableCell>
                    <TableCell colSpan={3} align="center">
                      Available IPs
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Went Spam</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedServerData.map((server: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{server.host}</TableCell>
                      <TableCell>{server.provider}</TableCell>
                      <TableCell>{server.status}</TableCell>
                      <TableCell colSpan={3}>
                        {server?.availableIps?.map(
                          (ip: any, ipIndex: number) => (
                            <TableRow key={ipIndex}>
                              <TableCell align="left">{ip.ip}</TableCell>
                              <TableCell>
                                {ip.isMainIp ? "Main IP" : "Secondary IP"}
                              </TableCell>
                              <TableCell align="center">
                                {ip.wentSpam ? "Yes" : "No"}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No server details available.</Typography>
          )}
        </Box>
      </ReusableModal>
    </Box>
  );
};

export default Users;
