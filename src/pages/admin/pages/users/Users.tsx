import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../utils/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiGet("/users");
        setUsers(response.data.users);
        setTotalElements(response.data?.users?.length);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
      renderCell: (params: any) =>
        params.value
          .map(
            (server: any) =>
              `${server.host} (${server?.availableIps?.length} IPs)`
          )
          .join(", "),
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
      ) : (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row: any) => row._id}
            rowCount={totalElements}
            // paginations
            pageSizeOptions={[10, 25, 50, 100]}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          />
        </Box>
      )}
    </Box>
  );
};

export default Users;
